import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profile = mkdtempSync(join(tmpdir(), 'brandscope-mobile-check-'));
const browser = spawn(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: 'ignore' });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const portFile = join(profile, 'DevToolsActivePort');
for (let attempt = 0; attempt < 100 && !existsSync(portFile); attempt += 1) await delay(50);
if (!existsSync(portFile)) throw new Error('Chrome debugging port did not start.');

const [port] = readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const socket = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});

await command('Page.enable');
await command('Runtime.enable');
await command('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844
});
await command('Page.navigate', { url: 'http://127.0.0.1:5173/brand/bolans-bite' });
await delay(8000);

const inspect = async () => {
  const result = await command('Runtime.evaluate', {
    returnByValue: true,
    expression: `(() => ({
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders: [...document.querySelectorAll('body *')]
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.right > innerWidth + 1 || rect.left < -1)
        .slice(0, 20)
        .map(({ element, rect }) => ({
          tag: element.tagName,
          className: String(element.className || '').slice(0, 120),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        }))
    }))()`
  });
  return result.result.value;
};

const capture = async (name) => {
  const { data } = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  writeFileSync(join(process.cwd(), name), Buffer.from(data, 'base64'));
};

const products = await inspect();
await capture('mobile-products-check.png');
await command('Runtime.evaluate', { expression: `document.querySelectorAll('.brand-profile-tab')[2]?.click()` });
await delay(500);
const about = await inspect();
await capture('mobile-about-check.png');

console.log(JSON.stringify({ products, about }, null, 2));
socket.close();
browser.kill();
