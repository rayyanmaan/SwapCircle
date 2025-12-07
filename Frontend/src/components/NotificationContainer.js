'use client';

import { useState } from 'react';
import ToastNotification from './ToastNotification';

/**
 * NotificationContainer Component
 * 
 * Manages a stack of toast notifications and renders them.
 * Handles adding and removing notifications.
 */
export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      ...notification,
    };
    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Expose methods via window for NotificationContext to use
  if (typeof window !== 'undefined') {
    window.__notificationContainer = {
      addNotification,
      removeNotification,
      clearAll,
    };
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ToastNotification
            id={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration || 5000}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}

