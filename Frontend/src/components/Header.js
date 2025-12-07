'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import Logo from './Logo';
import NotificationCenter from './NotificationCenter';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-swapcircle-white border-b border-swapcircle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/browse"
                className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
              >
                Browse
              </Link>
              {isAuthenticated && (
                <Link
                  href="/upload"
                  className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
                >
                  List Item
                </Link>
              )}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for clothes..."
                  className="input-swapcircle search-tube"
                />
                <svg
                  className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 icon-tertiary pointer-events-none"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="btn-credit hover:bg-swapcircle-credit/80 transition-colors"
                  >
                    {user?.credits || 0} credits
                  </Link>
                  <NotificationCenter />
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-swapcircle-neutral-100 transition-colors"
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                      <div className="w-8 h-8 rounded-full bg-swapcircle-primary flex items-center justify-center text-white text-sm font-semibold">
                        {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-swapcircle-secondary hidden lg:block">
                        {user?.username || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <svg
                        className={`w-4 h-4 text-swapcircle-secondary transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-swapcircle py-1 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-swapcircle-secondary hover:bg-swapcircle-neutral-100 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-swapcircle-secondary hover:bg-swapcircle-neutral-100 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="btn-secondary"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn-primary"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 icon-primary"
              aria-label="Toggle menu"
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
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for clothes..."
                className="input-swapcircle search-tube"
              />
              <svg
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 icon-tertiary pointer-events-none"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-swapcircle py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/browse"
                  className="font-medium py-2 link-swapcircle"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/upload"
                    className="font-medium py-2 link-swapcircle"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    List Item
                  </Link>
                )}
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t border-swapcircle">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-swapcircle-primary flex items-center justify-center text-white font-semibold">
                          {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-swapcircle-primary">
                            {user?.username || user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-swapcircle-tertiary">
                            {user?.credits || 0} credits
                          </p>
                        </div>
                      </div>
                      <NotificationCenter />
                    </div>
                    <Link
                      href="/profile"
                      className="btn-secondary text-left"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="btn-secondary text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        openAuthModal('login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-secondary text-left"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-primary text-left"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        mode={authMode}
      />
    </>
  );
}

