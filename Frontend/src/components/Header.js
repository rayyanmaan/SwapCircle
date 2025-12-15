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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push('/');
  };

  // Scroll to section on homepage
  const scrollToSection = (sectionId) => {
    if (typeof window === 'undefined') return;

    const isHomepage = window.location.pathname === '/' || window.location.pathname === '';
    
    if (!isHomepage) {
      window.location.href = `/#${sectionId}`;
      return;
    }

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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

            {isAuthenticated ? (
              <>
                {/* Logged In - Desktop Navigation */}
                <div className="hidden md:flex items-center flex-1 mx-8 gap-6">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search items or users..."
                      className="input-swapcircle search-tube w-full"
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

                  {/* Navigation Links */}
                  <nav className="flex items-center gap-6">
                    <Link href="/browse" className="font-medium link-swapcircle hover:opacity-70 transition-opacity">
                      Browse
                    </Link>
                    <button 
                      onClick={() => scrollToSection('how-it-works')}
                      className="font-medium link-swapcircle hover:opacity-70 transition-opacity cursor-pointer bg-none border-none p-0"
                    >
                      How it works
                    </button>
                    <Link href="/profile" className="font-medium link-swapcircle hover:opacity-70 transition-opacity">
                      Profile
                    </Link>
                  </nav>
                </div>

                {/* Action Buttons - Logged In */}
                <div className="hidden md:flex items-center space-x-3">
                  <NotificationCenter />
                  
                  <Link href="/profile" className="btn-credit hover:bg-swapcircle-credit/80 transition-colors">
                    {user?.credits || 0} credits
                  </Link>
                  
                  <Link href="/upload" className="btn-primary">
                    List Item
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 rounded-lg hover:bg-swapcircle-neutral-100 hover:text-swapcircle-primary transition-colors text-swapcircle-secondary cursor-pointer"
                    aria-label="Logout"
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
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 icon-primary cursor-pointer"
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
              </>
            ) : (
              <>
                {/* Not Logged In - Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link href="/browse" className="font-medium link-swapcircle hover:opacity-70 transition-opacity">
                    Browse
                  </Link>
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

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="btn-secondary font-serif font-semibold"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn-primary font-serif font-semibold"
                  >
                    Sign Up
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 icon-primary cursor-pointer"
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
              </>
            )}
          </div>

          {/* Mobile Search Bar */}
          {!isAuthenticated && (
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
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-swapcircle py-4 space-y-4">
              {isAuthenticated ? (
                <>
                  <nav className="flex flex-col space-y-3">
                    <Link href="/browse" className="font-medium py-2 link-swapcircle" onClick={() => setIsMobileMenuOpen(false)}>
                      Browse
                    </Link>
                    <button 
                      onClick={() => {
                        scrollToSection('how-it-works');
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-medium py-2 link-swapcircle text-left"
                    >
                      How it works
                    </button>
                    <Link href="/profile" className="font-medium py-2 link-swapcircle" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </Link>
                  </nav>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-swapcircle">
                    <Link href="/upload" className="btn-primary text-center" onClick={() => setIsMobileMenuOpen(false)}>
                      List Item
                    </Link>
                    <button 
                      onClick={() => setShowLogoutConfirm(true)} 
                      className="btn-secondary text-left hover:bg-swapcircle-neutral-100 hover:text-swapcircle-primary transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <nav className="flex flex-col space-y-3">
                    <Link href="/browse" className="font-medium py-2 link-swapcircle" onClick={() => setIsMobileMenuOpen(false)}>
                      Browse
                    </Link>
                  </nav>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-swapcircle">
                    <button
                      onClick={() => {
                        openAuthModal('login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-secondary font-serif font-semibold text-left"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal('signup');
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-primary font-serif font-semibold text-left"
                    >
                      Sign Up
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ========== LOGOUT CONFIRMATION MODAL ========== */}
      {showLogoutConfirm && (
        <>
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40 cursor-pointer"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 shadow-lg pointer-events-auto">
              <h2 className="text-2xl font-serif font-bold mb-4 text-swapcircle-primary">
                Confirm Logout
              </h2>
              <p className="text-swapcircle-secondary mb-8 leading-relaxed">
                Are you sure you want to log out? You'll need to log in again to access your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 btn-primary cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        mode={authMode}
      />
    </>
  );
}
