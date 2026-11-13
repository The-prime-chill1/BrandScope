export function supportsDeviceNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getDeviceNotificationPermission() {
  return supportsDeviceNotifications() ? window.Notification.permission : 'unsupported';
}

export async function requestDeviceNotificationPermission() {
  if (!supportsDeviceNotifications()) return 'unsupported';
  return window.Notification.requestPermission();
}

export async function showDeviceNotification(notification) {
  if (!supportsDeviceNotifications() || window.Notification.permission !== 'granted') return false;

  const title = notification.type === 'verification'
    ? 'BRANDSCOPE verification update'
    : notification.type === 'system'
      ? 'BRANDSCOPE platform update'
      : 'New BRANDSCOPE notification';
  const options = {
    body: notification.message,
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    tag: `brandscope-${notification.id}`,
    data: { url: notification.link || '/dashboard/notifications' }
  };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
  }

  const browserNotification = new window.Notification(title, options);
  browserNotification.onclick = () => {
    window.focus();
    window.location.assign(options.data.url);
    browserNotification.close();
  };
  return true;
}
