'use client';

import { useState } from 'react';
import AuthModal from './AuthModal';

export default function Header() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-bold" style={{ color: '#9333ea' }}>
                SwapCircle
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: '#7c3aed' }}
              >
                Swap
              </a>
              <a
                href="#"
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: '#7c3aed' }}
              >
                Browse
              </a>
              <a
                href="#"
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: '#7c3aed' }}
              >
                How It Works
              </a>
              <a
                href="#"
                className="font-medium transition-colors hover:opacity-70"
                style={{ color: '#7c3aed' }}
              >
                About
              </a>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for clothes..."
                  className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  style={{ 
                    borderColor: '#fbcfe8',
                    color: '#7c3aed'
                  }}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: '#a78bfa' }}
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                className="p-2 transition-colors"
                aria-label="Favorites"
                style={{ color: '#7c3aed' }}
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
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                className="p-2 transition-colors"
                aria-label="Shopping bag"
                style={{ color: '#7c3aed' }}
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
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 text-white rounded-md font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#9333ea' }}
              >
                Swap Now
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 border-2 rounded-md font-medium transition-colors hover:opacity-70"
                style={{ borderColor: '#9333ea', color: '#9333ea', backgroundColor: 'transparent' }}
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 text-white rounded-md font-medium transition-colors hover:opacity-90"
                style={{ borderColor: '#9333ea', backgroundColor: '#9333ea' }}
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
              style={{ color: '#7c3aed' }}
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
                className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400"
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
            <div className="md:hidden border-t border-neutral-200 py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <a
                  href="#"
                  className="font-medium py-2 transition-colors hover:opacity-70"
                  style={{ color: '#7c3aed' }}
                >
                  Swap
                </a>
                <a
                  href="#"
                  className="font-medium py-2 transition-colors hover:opacity-70"
                  style={{ color: '#7c3aed' }}
                >
                  Browse
                </a>
                <a
                  href="#"
                  className="font-medium py-2 transition-colors hover:opacity-70"
                  style={{ color: '#7c3aed' }}
                >
                  How It Works
                </a>
                <a
                  href="#"
                  className="font-medium py-2 transition-colors hover:opacity-70"
                  style={{ color: '#7c3aed' }}
                >
                  About
                </a>
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 border rounded-md text-left font-medium hover:bg-gray-50"
                  style={{ borderColor: '#fbcfe8', color: '#7c3aed' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    openAuthModal('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-white rounded-md text-left font-medium hover:opacity-90"
                  style={{ backgroundColor: '#9333ea' }}
                >
                  Sign Up
                </button>
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

