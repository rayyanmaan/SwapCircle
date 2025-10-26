'use client';

import { useState, useEffect } from 'react';

export default function AuthModal({ isOpen, onClose, mode = 'login' }) {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setAuthMode(mode);
  }, [mode]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log({ authMode, email, password });
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#fbcfe8' }}>
          <h2
            id="modal-title"
            className="text-2xl font-bold"
            style={{ color: '#9333ea' }}
          >
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="transition-colors hover:opacity-70"
            aria-label="Close modal"
            style={{ color: '#a78bfa' }}
          >
            <svg
              className="w-6 h-6"
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1"
                style={{ color: '#1e1b4b' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                placeholder="you@example.com"
                style={{ 
                  borderColor: '#fbcfe8',
                  color: '#1e1b4b'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#9333ea';
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = '0 0 0 2px rgba(147, 51, 234, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fbcfe8';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
                style={{ color: '#1e1b4b' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                placeholder="••••••••"
                style={{ 
                  borderColor: '#fbcfe8',
                  color: '#1e1b4b'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#9333ea';
                  e.target.style.outline = 'none';
                  e.target.style.boxShadow = '0 0 0 2px rgba(147, 51, 234, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#fbcfe8';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium mb-1"
                  style={{ color: '#1e1b4b' }}
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  placeholder="••••••••"
                  style={{ 
                    borderColor: '#fbcfe8',
                    color: '#1e1b4b'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#9333ea';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 2px rgba(147, 51, 234, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#fbcfe8';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              className="w-full text-white py-3 rounded-md font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#9333ea' }}
            >
              {authMode === 'login' ? 'Log In' : 'Sign Up'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm transition-colors hover:opacity-70"
                style={{ color: '#7c3aed' }}
              >
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <span className="font-medium underline">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="font-medium underline">Log in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

