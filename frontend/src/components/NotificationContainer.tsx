import { useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';

export function NotificationContainer() {
  const { notifications, removeNotification } = useUiStore();

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 9999, pointerEvents: 'none' }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  };
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const alertClass = {
    success: 'alert-success',
    error: 'alert-danger',
    info: 'alert-info',
    warning: 'alert-warning',
  }[notification.type];

  return (
    <div
      className={`alert ${alertClass} alert-dismissible d-flex align-items-center gap-2 shadow mb-2 fade show`}
      role="alert"
      style={{ pointerEvents: 'auto', minWidth: '280px', maxWidth: '360px' }}
    >
      <span className="flex-grow-1">{notification.message}</span>
      <button
        type="button"
        className="btn-close flex-shrink-0"
        onClick={onClose}
        aria-label="Close"
      />
    </div>
  );
}
