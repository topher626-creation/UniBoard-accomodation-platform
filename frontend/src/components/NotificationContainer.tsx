import { useEffect } from 'react';
import { Card, CardBody } from '@nextui-org/react';
import { useUiStore } from '@/stores/uiStore';

export function NotificationContainer() {
  const { notifications, removeNotification } = useUiStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
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

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  }[notification.type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[notification.type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }[notification.type];

  return (
    <Card
      className={`${bgColor} border pointer-events-auto shadow-lg rounded-lg`}
      shadow="sm"
    >
      <CardBody className="p-4 flex-row items-center gap-3">
        <span className={`text-xl font-bold ${textColor}`}>{icon}</span>
        <p className={`${textColor} font-medium flex-1`}>{notification.message}</p>
        <button
          onClick={onClose}
          className={`text-lg font-bold ${textColor} hover:opacity-70 transition-opacity`}
        >
          ✕
        </button>
      </CardBody>
    </Card>
  );
}
