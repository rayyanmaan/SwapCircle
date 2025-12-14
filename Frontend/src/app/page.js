'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import ListingsGrid from '@/components/ListingsGrid';
import ValueProposition from '@/components/ValueProposition';
import Footer from '@/components/Footer';
import { itemsAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch featured items
  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItems();
        const availableItems = Array.isArray(data) 
          ? data.filter(item => item.status === "available")
          : [];
        
        const transformedListings = availableItems.map((item) => {
          const metadata = getItemMetadata(item);
          const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
          const imageUrl = firstImage ? getImageUrl(firstImage) : '/api/placeholder/300';
          const isOwner = user && item.owner_id && user.id === item.owner_id;
          
          return {
            id: item.id,
            title: item.title,
            size: metadata.size || 'Size M',
            credits: metadata.credits || 2,
            condition: metadata.condition || 'Good',
            location: metadata.location || null,
            timestamp: 'Recently', // Backend doesn't store timestamp yet
            category: metadata.category || 'General',
            brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
            image: imageUrl,
            isOwner: isOwner,
          };
        });

        const limitedListings = transformedListings.slice(0, 8);
        setFeaturedListings(limitedListings);
      } catch (err) {
        console.error('Error fetching featured items:', err);
        setError(err.message || 'Failed to load featured items');
        setFeaturedListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, [user]);

  // Fetch swap history for logged-in users
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSwapHistory = async () => {
      try {
        setSwapLoading(true);
        const swaps = await itemsAPI.getSwapHistory();
        setSwapHistory(swaps);
      } catch (err) {
        console.error('Error fetching swap history:', err);
        setSwapHistory([]);
      } finally {
        setSwapLoading(false);
      }
    };

    fetchSwapHistory();
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen bg-swapcircle-white">

      {isAuthenticated ? (
        // LOGGED-IN VIEW
        <>
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-swapcircle-very-light-blue to-swapcircle-neutral-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-6 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-swapcircle-primary mb-2">
                    Welcome back, {user?.full_name || user?.username || 'there'}!
                  </h1>
                  <p className="text-swapcircle-secondary text-lg">
                    Ready to swap? Start exploring or list more items to earn credits.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-swapcircle">
                  <p className="text-swapcircle-tertiary text-sm mb-2">Your Credits</p>
                  <p className="text-4xl font-bold text-swapcircle-primary mb-3">
                    {user?.credits || 0}
                  </p>
                  <Link 
                    href="/upload"
                    className="btn-primary w-full text-center block"
                  >
                    List Item to Earn More
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Swap History Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="heading-primary text-3xl md:text-4xl font-bold mb-2">
                Your Swap History
              </h2>
              <p className="text-swapcircle-secondary mb-8">
                Here are your completed swaps
              </p>

              {swapLoading ? (
                <div className="text-center py-12">
                  <p className="text-swapcircle-secondary">Loading your swaps...</p>
                </div>
              ) : swapHistory.length === 0 ? (
                <div className="bg-swapcircle-neutral-50 rounded-lg p-12 text-center border border-swapcircle">
                  <h3 className="text-2xl font-serif font-bold text-swapcircle-primary mb-3">
                    No swaps yet!
                  </h3>
                  <p className="text-swapcircle-secondary mb-6">
                    Start browsing items and make your first swap to get going!
                  </p>
                  <Link 
                    href="/browse"
                    className="btn-primary inline-block"
                  >
                    Browse Items
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Given Away Section */}
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-swapcircle-primary mb-6">
                      Given Away
                    </h3>
                    <div className="space-y-4">
                      {swapHistory
                        .filter((swap) => swap.owner?.id === user?.id)
                        .slice(0, 5)
                        .map((swap) => (
                          <Link
                            key={swap.id}
                            href={`/product/${swap.item?.id}`}
                            className="flex gap-4 bg-white rounded-lg border border-swapcircle p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            {/* Item Image */}
                            <div className="flex-shrink-0 w-24 h-24">
                              {swap.item?.images && swap.item.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(swap.item.images[0])} 
                                  alt={swap.item?.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-swapcircle-neutral-200 rounded-lg flex items-center justify-center">
                                  <span className="text-swapcircle-tertiary text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-swapcircle-primary mb-1 truncate">
                                {swap.item?.title || 'Item'}
                              </h4>
                              <p className="text-sm text-swapcircle-tertiary mb-2">
                                Swapped with: <span className="font-medium text-swapcircle-secondary">{swap.requester?.username || 'Unknown'}</span>
                              </p>
                              <p className="text-xs text-swapcircle-tertiary">
                                {new Date(swap.updated_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Credits */}
                            <div className="flex-shrink-0 text-right">
                              <p className="text-lg font-bold text-green-600">
                                +{swap.credits_required}
                              </p>
                              <p className="text-xs text-swapcircle-tertiary">credits</p>
                            </div>
                          </Link>
                        ))}
                      {swapHistory.filter((swap) => swap.owner?.id === user?.id).length === 0 && (
                        <p className="text-swapcircle-secondary text-center py-6">
                          No items given away yet
                        </p>
                      )}
                    </div>
                    {swapHistory.filter((swap) => swap.owner?.id === user?.id).length > 5 && (
                      <div className="mt-6 text-center">
                        <Link 
                          href="/profile"
                          className="text-swapcircle-primary font-semibold hover:opacity-70 transition-opacity inline-block"
                        >
                          See More
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Received Section */}
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-swapcircle-primary mb-6">
                      Received
                    </h3>
                    <div className="space-y-4">
                      {swapHistory
                        .filter((swap) => swap.requester?.id === user?.id)
                        .slice(0, 5)
                        .map((swap) => (
                          <Link
                            key={swap.id}
                            href={`/product/${swap.item?.id}`}
                            className="flex gap-4 bg-white rounded-lg border border-swapcircle p-4 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            {/* Item Image */}
                            <div className="flex-shrink-0 w-24 h-24">
                              {swap.item?.images && swap.item.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(swap.item.images[0])} 
                                  alt={swap.item?.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-swapcircle-neutral-200 rounded-lg flex items-center justify-center">
                                  <span className="text-swapcircle-tertiary text-xs">No image</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-swapcircle-primary mb-1 truncate">
                                {swap.item?.title || 'Item'}
                              </h4>
                              <p className="text-sm text-swapcircle-tertiary mb-2">
                                From: <span className="font-medium text-swapcircle-secondary">{swap.owner?.username || 'Unknown'}</span>
                              </p>
                              <p className="text-xs text-swapcircle-tertiary">
                                {new Date(swap.updated_at).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Credits */}
                            <div className="flex-shrink-0 text-right">
                              <p className="text-lg font-bold text-red-600">
                                -{swap.credits_required}
                              </p>
                              <p className="text-xs text-swapcircle-tertiary">credits</p>
                            </div>
                          </Link>
                        ))}
                      {swapHistory.filter((swap) => swap.requester?.id === user?.id).length === 0 && (
                        <p className="text-swapcircle-secondary text-center py-6">
                          No items received yet
                        </p>
                      )}
                    </div>
                    {swapHistory.filter((swap) => swap.requester?.id === user?.id).length > 5 && (
                      <div className="mt-6 text-center">
                        <Link 
                          href="/profile"
                          className="text-swapcircle-primary font-semibold hover:opacity-70 transition-opacity inline-block"
                        >
                          See More
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Featured Items Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-swapcircle-alt">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="heading-primary text-3xl md:text-4xl font-bold mb-4">
                  Featured Items
                </h2>
                <p className="text-swapcircle-secondary text-lg max-w-2xl mx-auto">
                  Discover amazing items from your campus community
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

          {/* How It Works Section */}
          <section id="how-it-works">
            <ValueProposition />
          </section>

          <Footer />
        </>
      ) : (
        // NON-LOGGED-IN VIEW (Original)
        <>
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

          {/* How It Works Section */}
          <section id="how-it-works">
            <ValueProposition />
          </section>

          <Footer />
        </>
      )}
    </main>
  );
}