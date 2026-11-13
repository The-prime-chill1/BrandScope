import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dataStore } from '../../services/dataStore';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, Check, CheckCheck, UserPlus, Heart, MessageSquare } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { NotificationPermissionButton } from '../../components/common/NotificationPermissionButton';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState(
    user ? dataStore.getNotifications(user.uid) : []
  );

  useEffect(() => dataStore.subscribe(() => {
    setNotifications(user ? dataStore.getNotifications(user.uid) : []);
  }), [user]);

  const handleMarkAsRead = async (id) => {
    await dataStore.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await dataStore.markAllNotificationsAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  const getIcon = (type) => {
    if (type === 'follow') return <UserPlus size={16} color="var(--color-blue)" />;
    if (type === 'like') return <Heart size={16} color="#E11D48" />;
    if (type === 'comment') return <MessageSquare size={16} color="var(--color-success)" />;
    return <Bell size={16} color="var(--color-navy)" />;
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Notifications</h1>
          <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>
            Follower events, post reactions, comments, and account updates.
          </p>
        </div>

        <div className="notification-page-actions">
          <NotificationPermissionButton />
          {notifications.some((n) => !n.read) && (
            <button type="button" onClick={handleMarkAllRead} className="btn btn-outline btn-sm" style={{ gap: '6px' }}>
              <CheckCheck size={15} />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When other businesses follow you, like your posts, or comment, notifications will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: n.read ? 'var(--color-surface)' : 'var(--color-blue-subtle)',
                borderColor: n.read ? 'var(--color-border)' : 'var(--color-blue-border)',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.925rem', color: 'var(--color-navy)', fontWeight: n.read ? 500 : 700 }}>
                    {n.message}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                  >
                    View
                  </Link>
                )}
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="btn btn-ghost btn-sm"
                    title="Mark as read"
                    style={{ padding: '6px' }}
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
