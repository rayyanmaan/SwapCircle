'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import ItemCard from './ItemCard';
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
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            size={item.size}
            location={item.location}
            credits={item.credits}
            imageUrl={item.imageUrl}
            condition={item.condition}
            onSwapClick={handleSwapClick}
          />
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

