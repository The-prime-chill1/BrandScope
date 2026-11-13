function repairProtocol(value) {
  return value
    .replace(/^https:\/(?!\/)/i, 'https://')
    .replace(/^http:\/(?!\/)/i, 'http://');
}

export function normalizeExternalUrl(value) {
  const raw = repairProtocol(String(value || '').trim());
  if (!raw) return '';

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(candidate);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Please enter a valid HTTP or HTTPS link.');
  }
  return parsed.toString();
}

export function normalizeWhatsAppContact(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^(?:https?:\/\/|https?:\/|wa\.me\/|api\.whatsapp\.com\/|www\.whatsapp\.com\/)/i.test(raw)) {
    const normalized = normalizeExternalUrl(raw);
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (!['wa.me', 'api.whatsapp.com', 'whatsapp.com'].includes(host)) {
      throw new Error('Please use an official wa.me or WhatsApp link.');
    }
    return normalized;
  }

  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) {
    throw new Error('Please enter a valid WhatsApp number or wa.me link.');
  }
  return `https://wa.me/${digits}`;
}

export function createWhatsAppUrl(whatsapp, message = '') {
  if (!whatsapp) return '';

  try {
    const parsed = new URL(normalizeWhatsAppContact(whatsapp));
    if (message) parsed.searchParams.set('text', message);
    return parsed.toString();
  } catch {
    return '';
  }
}

export function normalizeContactEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid public business email address.');
  }
  return email;
}

export function createPhoneUrl(value) {
  const phone = String(value || '').trim();
  if (!phone) return '';
  const normalized = phone.replace(/[^\d+]/g, '');
  return normalized ? `tel:${normalized}` : '';
}
