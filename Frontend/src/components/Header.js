'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import Logo from './Logo';
import NotificationCenter from './NotificationCenter';
import { apiRequest } from '@/services/api';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchDropdownRef = useRef(null);

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

  // Search for users as user types
  const handleSearchInput = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    setSearchLoading(true);

    try {
      const response = await apiRequest(`/users/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
  };

  // Handle search result click and navigation
  const handleSearchResultClick = (username) => {
    console.log('Navigating to profile:', username);
    setShowSearchDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    router.push(`/profile/${username}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isSearchResultClick = event.target.closest('[data-search-result]');
      
      if (isSearchResultClick) {
        return;
      }

      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo />
              </Link>
            </div>

            {/* Middle: Search Bar + Navigation (Logged In) */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-8 flex-1 px-8" ref={searchDropdownRef}>
                {/* User Search Bar with Dropdown */}
                <div className="relative flex-1 max-w-xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users"
                      className="input-swapcircle search-tube w-full"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      onFocus={() => searchQuery.trim().length > 0 && setShowSearchDropdown(true)}
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

                    {/* Clear button */}
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear search"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500"
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
                    )}
                  </div>

                  {/* Search Dropdown */}
                  {showSearchDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-swapcircle rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-swapcircle-primary"></div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {searchResults.map((userResult) => (
                            <div
                              key={userResult.id}
                              data-search-result="true"
                              onClick={() => handleSearchResultClick(userResult.username)}
                              className="w-full px-4 py-3 hover:bg-swapcircle-neutral-100 active:bg-gray-100 transition-all duration-150 flex items-center gap-3 text-left cursor-pointer group block"
                            >
                              {/* User Avatar with Initials Fallback - Desktop */}
                              <div className="relative w-12 h-12 rounded-full bg-swapcircle-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {userResult.avatar ? (
                                  <img
                                    src={userResult.avatar}
                                    alt={userResult.username}
                                    className="w-full h-full object-cover"
                                    onLoad={(e) => {
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'none';
                                      }
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <span className="text-white font-bold text-sm" style={{ display: 'flex' }}>
                                  {userResult.initials || userResult.username[0].toUpperCase()}
                                </span>
                              </div>

                              {/* User Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-swapcircle-primary text-sm truncate">
                                  {userResult.username}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                  {userResult.full_name || userResult.username}
                                </p>

                                {/* Rating */}
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs font-medium text-gray-700">
                                    ⭐ {userResult.averageRating?.toFixed(1) || 'No rating'}
                                  </span>
                                  {userResult.totalSwaps > 0 && (
                                    <span className="text-xs text-gray-500">
                                      • {userResult.totalSwaps} swaps
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Links */}
                <nav className="flex items-center gap-6 whitespace-nowrap">
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
            )}

            {/* Middle: Browse Link (Not Logged In) */}
            {!isAuthenticated && (
              <nav className="hidden md:flex items-center flex-1 px-8">
                <Link href="/browse" className="font-medium link-swapcircle hover:opacity-70 transition-opacity">
                  Browse
                </Link>
              </nav>
            )}

            {/* Right: Action Buttons */}
            {isAuthenticated ? (
              <>
                {/* Action Buttons - Logged In */}
                <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
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
                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
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

          {/* Mobile Search Bar - HIDDEN ON DESKTOP */}
          {isAuthenticated && (
            <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4" ref={searchDropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="input-swapcircle search-tube w-full"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSearchDropdown(true)}
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

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                )}
              </div>

              {/* Mobile Search Dropdown */}
              {showSearchDropdown && (
                <div className="mt-2 bg-white border border-swapcircle rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-swapcircle-primary"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {searchResults.map((userResult) => (
                        <div
                          key={userResult.id}
                          data-search-result="true"
                          onClick={() => handleSearchResultClick(userResult.username)}
                          className="w-full px-4 py-3 hover:bg-swapcircle-neutral-100 active:bg-gray-100 transition-all duration-150 flex items-center gap-3 text-left cursor-pointer group block"
                        >
                          {/* User Avatar with Initials Fallback - Mobile */}
                          <div className="relative w-10 h-10 rounded-full bg-swapcircle-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {userResult.avatar ? (
                              <img
                                src={userResult.avatar}
                                alt={userResult.username}
                                className="w-full h-full object-cover"
                                onLoad={(e) => {
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'none';
                                  }
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <span className="text-white font-bold text-xs" style={{ display: 'flex' }}>
                              {userResult.initials || userResult.username[0].toUpperCase()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-swapcircle-primary text-sm truncate">
                              {userResult.username}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs font-medium text-gray-700">
                                ⭐ {userResult.averageRating?.toFixed(1) || 'No rating'}
                              </span>
                              {userResult.totalSwaps > 0 && (
                                <span className="text-xs text-gray-500">
                                  • {userResult.totalSwaps}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu - HIDDEN ON DESKTOP */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-swapcircle max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
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