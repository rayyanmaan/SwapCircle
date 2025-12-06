'use client';

import { useAuth } from '@/contexts/AuthContext';
import AuthModal from './AuthModal';
import ItemCard from './ItemCard';
import { useState, useEffect } from 'react';
import { itemsAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';

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
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItems();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleSwapClick = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    // TODO: Implement actual swap functionality
  };

  // Transform backend item format to ItemCard format
  const transformItem = (item) => {
    // Get metadata (prefers direct fields, falls back to parsing description for old items)
    const metadata = getItemMetadata(item);
    
    // Get first image URL if available
    const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
    const imageUrl = firstImage ? getImageUrl(firstImage) : '/api/placeholder/300';
    
    // Check if current user is the owner
    const isOwner = user && item.owner_id && user.id === item.owner_id;
    
    return {
      id: item.id,
      title: item.title,
      size: metadata.size || 'Size M',
      location: metadata.location || 'San Francisco',
      credits: metadata.credits || 2,
      imageUrl: imageUrl,
      condition: metadata.condition || 'Good',
      isOwner: isOwner,
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="heading-primary text-3xl font-bold mb-6">Listings</h1>
      
      {loading && (
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary">Loading items...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-swapcircle-secondary text-lg">No items found. Be the first to list an item!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const transformed = transformItem(item);
                return (
                  <ItemCard
                    key={item.id}
                    id={transformed.id}
                    title={transformed.title}
                    size={transformed.size}
                    location={transformed.location}
                    credits={transformed.credits}
                    imageUrl={transformed.imageUrl}
                    condition={transformed.condition}
                    onSwapClick={handleSwapClick}
                    isOwner={transformed.isOwner}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}

