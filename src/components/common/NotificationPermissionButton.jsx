import React, { useState } from 'react';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import {
  getDeviceNotificationPermission,
  requestDeviceNotificationPermission,
  supportsDeviceNotifications
} from '../../services/deviceNotifications';

export const NotificationPermissionButton = ({ compact = false, className = '' }) => {
  const { addToast } = useToast();
  const [permission, setPermission] = useState(getDeviceNotificationPermission());

  if (!supportsDeviceNotifications()) return null;

  const enable = async () => {
    const result = await requestDeviceNotificationPermission();
    setPermission(result);
    if (result === 'granted') addToast('Live device alerts are now enabled.', 'success');
    if (result === 'denied') addToast('Notifications are blocked in this browser. You can enable them in site settings.', 'error');
  };

  const enabled = permission === 'granted';
  return (
    <button
      type="button"
      className={`notification-permission-btn ${compact ? 'is-compact' : ''} ${enabled ? 'is-enabled' : ''} ${className}`.trim()}
      onClick={enable}
      disabled={enabled}
      title={enabled ? 'Device alerts enabled' : 'Enable live device alerts'}
    >
      {enabled ? <CheckCircle2 size={16} /> : <BellRing size={16} />}
      {!compact && <span>{enabled ? 'Device alerts on' : 'Enable device alerts'}</span>}
    </button>
  );
};

export default NotificationPermissionButton;
