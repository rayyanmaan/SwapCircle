'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import ListingsGrid from '@/components/ListingsGrid';
import ValueProposition from '@/components/ValueProposition';
import Footer from '@/components/Footer';
import GuestRoute from '@/components/GuestRoute';
import { itemsAPI } from '@/services/api';
import { parseItemMetadata, getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItems();
        // Filter to only show available items
        const availableItems = Array.isArray(data) 
          ? data.filter(item => item.status === "available")
          : [];
        
        // Transform backend items to listing format
        const transformedListings = availableItems.map((item) => {
          // Parse metadata from description
          const metadata = parseItemMetadata(item.description);
          
          // Get first image URL if available
          const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
          const imageUrl = firstImage ? getImageUrl(firstImage) : '/api/placeholder/300';
          
          // Check if current user is the owner
          const isOwner = user && item.owner_id && user.id === item.owner_id;
          
          return {
            id: item.id,
            title: item.title,
            size: metadata.size || 'Size M',
            credits: metadata.credits || 2,
            condition: metadata.condition || 'Good',
            timestamp: 'Recently', // Backend doesn't store timestamp yet
            category: metadata.category || 'General',
            brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
            image: imageUrl,
            isOwner: isOwner,
          };
        });

        // Limit to 8 featured items (or all if less than 8)
        const limitedListings = transformedListings.slice(0, 8);
        setFeaturedListings(limitedListings);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setError(err.message || 'Failed to load featured items');
        // On error, set empty array so it shows "no items" message
        setFeaturedListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, [user]); // Re-fetch if user changes (to update isOwner status)

  return (
    <GuestRoute>
      <main className="min-h-screen bg-swapcircle-white">
        <HeroSection />
        
        {/* Featured Products Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-swapcircle-alt">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-primary text-3xl md:text-4xl font-bold mb-4">
                Featured Items
              </h2>
              <p className="text-swapcircle-secondary text-lg max-w-2xl mx-auto">
                Discover the most popular items from your campus community
              </p>
            </div>
            
            {loading && (
              <div className="text-center py-12">
                <p className="text-swapcircle-secondary">Loading featured items...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {featuredListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-swapcircle-secondary text-lg">
                      No items available yet. Be the first to list an item!
                    </p>
                  </div>
                ) : (
                  <ListingsGrid title="" listings={featuredListings} />
                )}
              </>
            )}
          </div>
        </section>

        <ValueProposition />
        <Footer />
      </main>
    </GuestRoute>
  );
}
