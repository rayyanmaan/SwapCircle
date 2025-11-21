'use client';

import { useState, useEffect } from 'react';

export default function SwapSuccessModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState('loading'); // 'loading' or 'success'

  useEffect(() => {
    if (isOpen) {
      // Start with loading phase
      setPhase('loading');
      
      // After 2.2s, switch to success phase
      const successTimer = setTimeout(() => {
        setPhase('success');
      }, 2200);

      // Auto-close after 4s total
      const closeTimer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => {
        clearTimeout(successTimer);
        clearTimeout(closeTimer);
      };
    } else {
      setPhase('loading');
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl p-12 text-center max-w-md w-[90%]">
        {/* Loading/Success Animation Container */}
        <div className="flex items-center justify-center gap-0 my-8 h-[150px] relative">
          {/* Left Circle (Blue) */}
          <div
            className={`relative w-[60px] h-[60px] rounded-full border-4 border-swapcircle-primary ${
              phase === 'loading'
                ? 'animate-swap-bounce-left -mr-5 z-10'
                : 'animate-swap-meet-left -mr-5 z-10'
            }`}
          />
          
          {/* Right Circle (Black) */}
          <div
            className={`relative w-[60px] h-[60px] rounded-full border-4 ${
              phase === 'loading'
                ? 'animate-swap-bounce-right -ml-5 z-0'
                : 'animate-swap-meet-right -ml-5 z-0'
            }`}
            style={{ borderColor: '#000000' }}
          />
          
          {/* Checkmark (appears in success phase) */}
          {phase === 'success' && (
            <div className="absolute text-4xl" style={{ color: '#10B981' }}>
              <span className="animate-check-scale inline-block">✓</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="heading-primary text-2xl font-semibold mb-2">
          {phase === 'loading' ? 'Processing your swap...' : 'Swap successful!'}
        </h3>
        
        {/* Message */}
        <p className="text-swapcircle-secondary">
          {phase === 'loading'
            ? 'Connecting you with the seller'
            : 'You will hear from the seller soon'}
        </p>
      </div>
    </div>
  );
}

