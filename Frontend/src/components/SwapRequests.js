'use client';

import { useState, useEffect } from 'react';
import { itemsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';

export default function SwapRequests() {
  const { user, refreshUser } = useAuth();
  const [swapRequests, setSwapRequests] = useState({ as_owner: [], as_requester: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSwapRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getSwapRequests();
        setSwapRequests(data);
      } catch (err) {
        console.error('Error fetching swap requests:', err);
        setError(err.message || 'Failed to load swap requests');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchSwapRequests();
    }
  }, [user]);

  const handleApprove = async (itemId, requestId) => {
    try {
      await itemsAPI.approveSwapRequest(itemId, requestId);
      
      // Refresh user data to get updated credits
      if (refreshUser) {
        await refreshUser();
      }
      alert('Swap request approved! Credits have been transferred.');
      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
      // Refresh page to update item statuses
      window.location.reload();
    } catch (err) {
      console.error('Error approving swap request:', err);
      alert(err.message || 'Failed to approve swap request');
    }
  };

  const handleReject = async (itemId, requestId) => {
    if (!confirm('Are you sure you want to reject this swap request?')) {
      return;
    }

    try {
      await itemsAPI.rejectSwapRequest(itemId, requestId);
      alert('Swap request rejected.');
      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
      // Refresh page to update item statuses
      window.location.reload();
    } catch (err) {
      console.error('Error rejecting swap request:', err);
      alert(err.message || 'Failed to reject swap request');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-swapcircle-secondary">Loading swap requests...</p>
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

  return (
    <div className="space-y-8">
      {/* Requests for my items (as owner) */}
      <div>
        <h2 className="heading-primary text-2xl font-bold mb-4">
          Swap Requests for My Items
        </h2>
        {swapRequests.as_owner.length === 0 ? (
          <p className="text-swapcircle-secondary">No pending swap requests for your items.</p>
        ) : (
          <div className="space-y-4">
            {swapRequests.as_owner.map((request) => {
              const itemImage = request.item?.images?.[0] 
                ? getImageUrl(request.item.images[0])
                : '/api/placeholder/300';
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0">
                      <img
                        src={itemImage}
                        alt={request.item?.title || 'Item'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <h3 className="heading-primary text-lg font-semibold mb-2">
                        {request.item?.title || 'Unknown Item'}
                      </h3>
                      <div className="space-y-1 text-sm text-swapcircle-secondary mb-4">
                        <p>
                          <strong>Requested by:</strong>{' '}
                          {request.requester?.full_name || request.requester?.username || 'Unknown'}
                        </p>
                        <p>
                          <strong>Credits required:</strong> {request.credits_required}
                        </p>
                        <p>
                          <strong>Requested:</strong>{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request.item_id, request.id)}
                          className="btn-primary px-6 py-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.item_id, request.id)}
                          className="btn-secondary px-6 py-2"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My requests (as requester) */}
      <div>
        <h2 className="heading-primary text-2xl font-bold mb-4">
          My Swap Requests
        </h2>
        {swapRequests.as_requester.length === 0 ? (
          <p className="text-swapcircle-secondary">You haven&apos;t made any swap requests yet.</p>
        ) : (
          <div className="space-y-4">
            {swapRequests.as_requester.map((request) => {
              const itemImage = request.item?.images?.[0] 
                ? getImageUrl(request.item.images[0])
                : '/api/placeholder/300';
              
              const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                approved: 'bg-green-100 text-green-800',
                rejected: 'bg-red-100 text-red-800',
                cancelled: 'bg-gray-100 text-gray-800',
              };

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0">
                      <img
                        src={itemImage}
                        alt={request.item?.title || 'Item'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="heading-primary text-lg font-semibold">
                          {request.item?.title || 'Unknown Item'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[request.status] || statusColors.pending
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-swapcircle-secondary">
                        <p>
                          <strong>Credits required:</strong> {request.credits_required}
                        </p>
                        <p>
                          <strong>Requested:</strong>{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.status === 'pending' && (
                          <p className="text-swapcircle-primary mt-2">
                            Waiting for owner approval...
                          </p>
                        )}
                        {request.status === 'approved' && (
                          <p className="text-green-600 mt-2">
                            ✓ Swap approved! Credits have been transferred.
                          </p>
                        )}
                        {request.status === 'rejected' && (
                          <p className="text-red-600 mt-2">
                            Swap request was rejected by the owner.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

