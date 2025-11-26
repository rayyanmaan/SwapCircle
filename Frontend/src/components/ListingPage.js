'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import { useState } from 'react';
import mockItems from '@/data/mockItems.json';

/**
 * ListingPage Component
 * 
 * A skeleton component for displaying individual listing details.
 * Based on the listing page design specification.
 * 
 * TODO: Replace mock data with backend API integration
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
      <h1 className="heading-primary text-3xl font-bold mb-6">Listings</h1>
      
      {/* TODO: Replace with backend API data fetching */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockItems.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 bg-white">
            {/* Image placeholder */}
            <div className="w-full aspect-square rounded-lg bg-swapcircle-alt mb-4 overflow-hidden">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title */}
            <h2 className="heading-primary text-xl font-semibold mb-2">
              {item.title}
            </h2>

            {/* Size and Location */}
            <div className="mb-2">
              <p className="text-swapcircle-secondary text-sm">
                Size: {item.size}
              </p>
              <p className="text-swapcircle-secondary text-sm">
                Location: {item.location}
              </p>
            </div>

            {/* Condition */}
            <div className="mb-3">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-swapcircle-alt text-swapcircle-primary">
                {item.condition}
              </span>
            </div>

            {/* Credits */}
            <div className="flex items-center gap-2 mb-4">
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
                {item.credits} credits
              </span>
            </div>

            {/* Swap Button */}
            <button
              className="btn-primary w-full"
              onClick={handleSwapClick}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}

