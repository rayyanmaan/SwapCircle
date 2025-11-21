'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { useState } from 'react';

/**
 * ListingPage Component
 * 
 * A skeleton component for displaying individual listing details.
 * Based on the listing page design specification.
 * 
 * TODO: Add props for listing data (id, title, description, images, credits, etc.)
 * TODO: Implement image gallery/carousel functionality
 * TODO: Add seller information section
 * TODO: Connect to backend API for fetching listing data
 * TODO: Implement swap/request button functionality
 * TODO: Add loading and error states
 */
export default function ListingPage() {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleSwapClick = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // TODO: Implement actual swap functionality
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Photo Section */}
      <div className="mb-6">
        {/* TODO: Replace with actual image component/gallery */}
        <div className="w-full aspect-square rounded-lg bg-swapcircle-alt">
          {/* Placeholder for product photo */}
          <div className="flex items-center justify-center h-full text-swapcircle-tertiary">
            Product Photo
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="mb-4">
        {/* TODO: Replace with actual title from props */}
        <h1 className="heading-primary text-2xl font-bold">
          Product Title
        </h1>
      </div>

      {/* Description Section */}
      <div className="mb-6">
        {/* TODO: Replace with actual description from props */}
        <div className="space-y-2">
          <h2 className="heading-primary text-lg font-semibold">
            About this item
          </h2>
          <p className="text-swapcircle-secondary">
            Product description will go here...
          </p>
        </div>
      </div>

      {/* Price/Credit Info Section */}
      <div className="mb-6 p-4 rounded-lg bg-swapcircle-alt">
        {/* TODO: Replace with actual credit value from props */}
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 icon-credit"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 8c-1.657 0-3 .895-3 2 0 1.105 1.343 2 3 2s3-.895 3-2c0-1.105-1.343-2-3-2z" />
          </svg>
          <span className="heading-primary text-lg font-semibold">
            Credits: 2
          </span>
        </div>
      </div>

      {/* Swap / Request Button Space */}
      <div className="mb-6">
        {!isAuthenticated ? (
          <div className="space-y-3">
            <button
              className="btn-primary w-full"
              onClick={handleSwapClick}
            >
              Swap / Request
            </button>
            <p className="text-sm text-swapcircle-tertiary text-center">
              Please log in to swap items
            </p>
          </div>
        ) : (
          <button
            className="btn-primary w-full"
            onClick={handleSwapClick}
          >
            Swap / Request
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}

