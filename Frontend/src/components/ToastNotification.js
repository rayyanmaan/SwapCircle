'use client';

import { useEffect } from 'react';

/**
 * ToastNotification Component
 * 
 * A reusable toast notification component that displays temporary messages.
 * Supports success, error, and info variants with auto-dismiss functionality.
 */
export default function ToastNotification({ 
  id,
  type = 'info', 
  message, 
  onClose, 
  duration = 5000 
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✓'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '✕'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg shadow-lg p-4 mb-3
        flex items-start justify-between
        min-w-[300px] max-w-[400px]
        animate-slide-in-right
        transition-all duration-300
      `}
      role="alert"
    >
      <div className="flex items-start flex-1">
        <span className="mr-3 text-lg font-semibold">{styles.icon}</span>
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`
          ml-4 ${styles.text}
          hover:opacity-70
          transition-opacity
          focus:outline-none
        `}
        aria-label="Close notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

