'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import Logo from './Logo';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleProtectedLink = (e, href) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal('login');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-swapcircle-white border-b border-swapcircle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
              >
                Home
              </Link>
              <Link
                href="/browse"
                className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
              >
                Browse
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/upload"
                    className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
                  >
                    Upload
                  </Link>
                  <Link
                    href="/profile"
                    className="font-medium link-swapcircle hover:opacity-70 transition-opacity"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Log Out
                </button>
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

            {/* TODO: Add active route highlighting using usePathname() hook */}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        mode={authMode}
      />
    </>
  );
}

