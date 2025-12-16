'use client';

import { useState, useEffect } from 'react';

export default function SwapProcessingModal({ 
  isOpen, 
  status = 'processing', 
  actionType = 'request', 
  onClose,
  customSuccessMessage = null,
  customSuccessSubtitle = null
}) {
  // status: 'processing', 'success', 'error'
  // actionType: 'request', 'cancel', 'approve', 'reject'

  // Auto-close after 8 seconds for success
  useEffect(() => {
    if (isOpen && status === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status, onClose]);

  if (!isOpen) return null;

  const successMessages = {
    request: {
      title: 'Swap request sent!',
      subtitle: 'Waiting for owner approval',
    },
    cancel: {
      title: 'Request cancelled!',
      subtitle: 'You can request other items',
    },
    approve: {
      title: 'Swap approved!',
      subtitle: 'Credits have been transferred',
    },
    reject: {
      title: 'Swap request rejected',
      subtitle: 'The requester will be notified',
    },
  };

  const successMessage = customSuccessMessage 
    ? { title: customSuccessMessage, subtitle: customSuccessSubtitle || '' }
    : (successMessages[actionType] || successMessages.request);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full flex flex-col items-center justify-center">
        {/* Logo circles - exact same as Logo.js */}
        <div className="relative flex items-center mb-6">
          {/* Left Circle (Primary Blue - #0046B0) */}
          <div className="relative w-7 h-7 rounded-full border-3 border-swapcircle-primary -mr-2 z-10" />
          
          {/* Right Circle (Almost Black - #0F0F0F) */}
          <div
            className="relative w-7 h-7 rounded-full border-3 -ml-2 z-0"
            style={{ borderColor: '#0F0F0F' }}
          />
        </div>

        {status === 'processing' && (
          <>
            {/* Processing text */}
            <h2 className="heading-primary text-lg font-bold text-center mb-1">
              {actionType === 'cancel' ? 'Cancelling request...' : 'Processing your swap...'}
            </h2>
            <p className="text-swapcircle-secondary text-center text-xs mb-4">
              {actionType === 'cancel' ? 'Just a moment' : 'Connecting you with the seller'}
            </p>

            {/* Loading dots */}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-swapcircle-primary rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-swapcircle-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-swapcircle-primary rounded-full animate-bounce delay-200"></div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            {/* Success text */}
            <h2 className="heading-primary text-lg font-bold text-center mb-1">
              {successMessage.title}
            </h2>
            <p className="text-swapcircle-secondary text-center text-xs mb-4">
              {successMessage.subtitle}
            </p>

            {/* Close button */}
            <button
              onClick={onClose}
              className="btn-primary px-6 py-1.5 text-sm"
            >
              Got it
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            {/* Error icon */}
            <div className="mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Error text */}
            <h2 className="heading-primary text-lg font-bold text-center mb-1">
              Something went wrong
            </h2>
            <p className="text-swapcircle-secondary text-center text-xs mb-4">
              {actionType === 'cancel'
                ? 'Failed to cancel swap request. Please try again.'
                : 'Failed to create swap request. Please try again.'}
            </p>

            {/* Close button */}
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-1.5 text-sm"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}