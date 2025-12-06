'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from './Footer';
import { userAPI, itemsAPI } from '@/services/api';
import { parseItemMetadata, getImageUrl } from '@/utils/itemParser';
import { normalizeUser, normalizeItem, categorizeError, safeGet } from '@/utils/validators';

export default function Profile() {
  const { isAuthenticated, user: authUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Fetch user profile data
  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await userAPI.getUser(authUser.id);
        
        if (!response) {
          throw new Error('No user data returned from server');
        }

        const normalizedUser = normalizeUser(response);
        setUserData(normalizedUser);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        const errorCategory = categorizeError(err);
        
        if (errorCategory === 'auth') {
          setError('Your session expired. Please log in again.');
        } else if (errorCategory === 'network') {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, authUser?.id]);

  // Fetch user items
  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) {
      return;
    }

    const fetchUserItems = async () => {
      try {
        const response = await itemsAPI.getItems();
        
        if (!Array.isArray(response)) {
          throw new Error('Invalid items response');
        }

        const userOwnedItems = response
          .filter(item => item?.owner_id === authUser.id)
          .map(item => normalizeItem(item, parseItemMetadata))
          .filter(item => item !== null); // Remove any failed normalizations

        setUserItems(userOwnedItems);
      } catch (err) {
        console.error('Error fetching user items:', err);
        setFetchError('Could not load your listings. ' + (err.message || 'Try again later.'));
        setUserItems([]);
      }
    };

    fetchUserItems();
  }, [isAuthenticated, authUser?.id]);

  // Fetch swap history (non-critical, doesn't block component)
  useEffect(() => {
    if (!isAuthenticated || !authUser?.id) {
      return;
    }

    const fetchSwapHistory = async () => {
      try {
        // This would be your swap history endpoint
        // const response = await userAPI.getSwapHistory(authUser.id);
        // For now, empty array since endpoint may not exist
        setSwapHistory([]);
      } catch (err) {
        console.error('Error fetching swap history:', err);
        // Don't block the page; just log and continue
        setSwapHistory([]);
      }
    };

    fetchSwapHistory();
  }, [isAuthenticated, authUser?.id]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-swapcircle-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="heading-primary text-3xl font-bold mb-4">Please log in</h1>
          <p className="text-swapcircle-secondary mb-6">Sign in to view your profile</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-swapcircle-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-swapcircle-primary mx-auto mb-4"></div>
          <p className="text-swapcircle-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-swapcircle-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayUser = userData || normalizeUser(null);

  return (
    <div className="min-h-screen bg-swapcircle-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
            <div className="w-24 h-24 rounded-full bg-swapcircle-primary flex items-center justify-center flex-shrink-0 mb-4 sm:mb-0">
              <span className="text-white text-4xl font-bold">{displayUser.avatar}</span>
            </div>
            <div className="flex-1">
              <h1 className="heading-primary text-3xl font-bold">{displayUser.full_name}</h1>
              <p className="text-swapcircle-secondary">@{displayUser.username}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm">
                <span className="text-swapcircle-secondary">{displayUser.email || 'Email not provided'}</span>
                <span className="flex items-center space-x-1">
                  <span className="text-swapcircle-secondary">Credits:</span>
                  <span className="font-semibold text-swapcircle-blue">{displayUser.credits}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fetch Error Alert (non-blocking) */}
        {fetchError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-700 text-sm">{fetchError}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-swapcircle-alt">
          <div className="flex space-x-8">
            {['listings', 'favorites', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-swapcircle-primary text-swapcircle-primary'
                    : 'text-swapcircle-secondary hover:text-swapcircle-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'listings' && (
            <div>
              {userItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-swapcircle-secondary mb-4">No listings yet</p>
                  <button className="btn-primary">Create Your First Listing</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map(item => (
                    <div key={item.id} className="rounded-lg overflow-hidden bg-swapcircle-alt border border-swapcircle-alt">
                      {item.images && item.images.length > 0 && (
                        <div className="relative aspect-[4/5] bg-swapcircle-alt overflow-hidden">
                          <img
                            src={getImageUrl(item.images[0])}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        <p className="text-sm text-swapcircle-secondary">{item.size} • {item.condition}</p>
                        <p className="mt-2 text-swapcircle-blue font-bold">{item.credits} Credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="text-center py-12">
              <p className="text-swapcircle-secondary">No favorites yet</p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-12">
              <p className="text-swapcircle-secondary">No swap history yet</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
