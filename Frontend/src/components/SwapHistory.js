'use client';

import { useState, useEffect } from 'react';
import { itemsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';

export default function SwapHistory() {
  const { user } = useAuth();
  const [swapHistory, setSwapHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSwapHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getSwapHistory();
        setSwapHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching swap history:', err);
        setError(err.message || 'Failed to load swap history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSwapHistory();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-swapcircle-secondary">Loading swap history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    );
  }

  if (swapHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-swapcircle-secondary text-lg">No swap history yet.</p>
        <p className="text-swapcircle-secondary text-sm mt-2">
          Your completed swaps will appear here.
        </p>
      </div>
    );
  }

  // Classify swaps based on is_seller flag
  // "Given Away" = user was the owner/seller (is_seller = true)
  // "Received" = user was the requester (is_seller = false)
  const givenSwaps = swapHistory.filter(s => s.is_seller === true);
  const receivedSwaps = swapHistory.filter(s => s.is_seller === false);

  const filteredSwaps = swapHistory.filter((s) => {
    if (activeTab === 'received') return s.is_seller === false;
    if (activeTab === 'given') return s.is_seller === true;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="swap-history-tabs inline-flex rounded-md overflow-hidden bg-white border border-swapcircle mb-4" role="tablist" aria-label="Swap history tabs">
        <button
          onClick={() => setActiveTab('all')}
          aria-selected={activeTab === 'all'}
          role="tab"
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'bg-swapcircle-alt text-swapcircle-primary' : 'text-swapcircle-secondary hover:text-swapcircle-primary'}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('received')}
          aria-selected={activeTab === 'received'}
          role="tab"
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'received' ? 'bg-swapcircle-alt text-swapcircle-primary' : 'text-swapcircle-secondary hover:text-swapcircle-primary'}`}
        >
          <span className="icon">↘</span>
          <span>Received</span>
          <span className="ml-1 text-xs text-swapcircle-tertiary">({receivedSwaps.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('given')}
          aria-selected={activeTab === 'given'}
          role="tab"
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'given' ? 'bg-swapcircle-alt text-swapcircle-primary' : 'text-swapcircle-secondary hover:text-swapcircle-primary'}`}
        >
          <span className="icon">↗</span>
          <span>Given Away</span>
          <span className="ml-1 text-xs text-swapcircle-tertiary">({givenSwaps.length})</span>
        </button>
      </div>

      {filteredSwaps.map((swap) => {
        const itemImage = swap.item?.images?.[0] 
          ? getImageUrl(swap.item.images[0])
          : '/api/placeholder/300';
        
        return (
          <div
            key={swap.id}
            className="border rounded-lg p-6 bg-white"
          >
            <div className="flex items-start gap-4">
              {/* Item Image */}
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0">
                <img
                  src={itemImage}
                  alt={swap.item?.title || 'Item'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Swap Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="heading-primary text-lg font-semibold">
                    {swap.item?.title || 'Unknown Item'}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-swapcircle-secondary mb-4">
                  <p>
                    <strong>{swap.is_seller ? 'Sold to' : 'Bought from'}:</strong>{' '}
                    {swap.other_user?.username ? (
                      <a
                        href={`/profile/${swap.other_user.username}`}
                        className="text-swapcircle-primary hover:underline"
                      >
                        {swap.other_user?.full_name || swap.other_user?.username || 'Unknown'}
                      </a>
                    ) : (
                      swap.other_user?.full_name || swap.other_user?.username || 'Unknown'
                    )}
                  </p>
                  <p>
                    <strong>Credits:</strong> {swap.credits_required}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(swap.updated_at || swap.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* View Item Link */}
                {swap.item?.id && (
                  <a
                    href={`/product/${swap.item.id}`}
                    className="text-swapcircle-primary hover:underline text-sm"
                  >
                    View Item →
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

