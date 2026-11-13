import React, { useEffect, useState } from 'react';
import { Download, MonitorSmartphone, Share2, X } from 'lucide-react';

export const InstallAppButton = ({ compact = false, className = '' }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setInstalled(standalone);
    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setShowGuide(false);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowGuide(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
  };

  return (
    <>
      <button type="button" className={`install-app-btn ${compact ? 'is-compact' : ''} ${className}`.trim()} onClick={handleInstall}>
        <Download size={compact ? 17 : 16} />
        <span>{compact ? 'Install' : 'Install app'}</span>
      </button>
      {showGuide && (
        <div className="install-guide-overlay" role="dialog" aria-modal="true" aria-label="Install BRANDSCOPE">
          <button type="button" className="install-guide-backdrop" aria-label="Close install guide" onClick={() => setShowGuide(false)} />
          <div className="install-guide-card">
            <button type="button" className="install-guide-close" onClick={() => setShowGuide(false)} aria-label="Close"><X size={19} /></button>
            <div className="install-guide-icon"><MonitorSmartphone size={26} /></div>
            <span className="install-guide-kicker">Install BRANDSCOPE</span>
            <h2>Keep brand discovery one tap away</h2>
            <p>Install BRANDSCOPE from your browser for a full-screen experience, faster return visits, and a Home Screen or desktop icon.</p>
            <div className="install-guide-steps">
              <div><Share2 size={18} /><span><strong>Phone or tablet</strong>Open your browser menu or Share menu, then choose “Add to Home Screen”.</span></div>
              <div><Download size={18} /><span><strong>Desktop</strong>Open the browser menu and choose “Install BRANDSCOPE” or “Install app”.</span></div>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={() => setShowGuide(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallAppButton;
