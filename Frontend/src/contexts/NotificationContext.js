'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationsAPI } from '@/services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pollingIntervalRef = useRef(null);
  const shownToastIds = useRef(new Set()); // For preventing duplicate toast notifications

  // Helper to format notification message
  const formatNotification = (notification) => {
    return {
      message: notification.message || `Swap event: ${notification.event_type}`,
      type: notification.event_type === 'approved' ? 'success' : 
            notification.event_type === 'rejected' ? 'error' : 'info',
    };
  };

  useEffect(() => {
    // Load notifications from backend
    const loadNotifications = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const [notificationsData, unreadData] = await Promise.all([
          notificationsAPI.getAll(50, false),
          notificationsAPI.getUnreadCount(),
        ]);

        setNotifications(notificationsData || []);
        setUnreadCount(unreadData?.count || 0);

        // Show toast notifications for new unread notifications
        if (window.__notificationContainer && notificationsData) {
          const newUnreadNotifications = notificationsData.filter(
            (n) => !n.read && !shownToastIds.current.has(n.id)
          );

          newUnreadNotifications.forEach((notification) => {
            shownToastIds.current.add(notification.id);
            const { message, type } = formatNotification(notification);
            
            // Show the toast
            setTimeout(() => {
              window.__notificationContainer.addNotification({
                type,
                message,
                duration: 5000,
              });
            }, 0);
            
            // Mark as read immediately after showing to prevent re-showing
            setTimeout(() => {
              notificationsAPI.markAsRead(notification.id).catch(err => {
                console.error('Error marking notification as read:', err);
              });
            }, 1000);
          });
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    // Don't poll if still loading auth state or not authenticated
    if (loading || !isAuthenticated || !user) {
      if (!isAuthenticated) {
        setNotifications([]);
        setUnreadCount(0);
        shownToastIds.current.clear();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Load notifications immediately
    loadNotifications();

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(loadNotifications, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, loading, user]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Reload notifications on error
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Update local state optimistically
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Reload notifications on error
      loadNotifications();
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      await notificationsAPI.delete(notificationId);
      // Update local state optimistically
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // Update unread count if the deleted notification was unread
      const deleted = notifications.find((n) => n.id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Reload notifications on error
      loadNotifications();
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
