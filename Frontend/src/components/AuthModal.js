'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, mode = 'login' }) {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAuthMode(mode);
    // Reset form when mode changes
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setFullName('');
    setError('');
  }, [mode]);

  useEffect(() => {
    setError('');
  }, [authMode]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        // Login
        if (!email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        const result = await login(email, password);
        if (result.success) {
          onClose();
          // Reset form
          setEmail('');
          setPassword('');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      } else {
        // Register
        if (!email || !password || !username) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const result = await register(email, password, username, fullName || undefined);
        if (result.success) {
          onClose();
          // Reset form
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setUsername('');
          setFullName('');
        } else {
          setError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-swapcircle">
          <h2
            id="modal-title"
            className="heading-primary text-2xl font-bold text-swapcircle-blue"
          >
            {authMode === 'login' ? 'Log In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="transition-colors hover:opacity-70 icon-tertiary"
            aria-label="Close modal"
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium mb-1 text-swapcircle-primary"
                  >
                    Username *
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-swapcircle"
                    placeholder="johndoe"
                  />
                </div>

                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium mb-1 text-swapcircle-primary"
                  >
                    Full Name (optional)
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-swapcircle"
                    placeholder="John Doe"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 text-swapcircle-primary"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-swapcircle"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1 text-swapcircle-primary"
              >
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-swapcircle"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {authMode === 'signup' && (
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium mb-1 text-swapcircle-primary"
                >
                  Confirm Password *
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-swapcircle"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : authMode === 'login' ? 'Log In' : 'Sign Up'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm link-swapcircle text-swapcircle-secondary"
              >
                {authMode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
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

