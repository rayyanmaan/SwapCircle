'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { itemsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/styles/theme';

export default function SwapRequests() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [swapRequests, setSwapRequests] = useState({ as_owner: [], as_requester: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelingRequestId, setCancelingRequestId] = useState(null);
  const [cancelingItemId, setCancelingItemId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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

  const handleCancelRequest = async () => {
    if (!cancelingItemId || !cancelingRequestId) {
      return;
    }

    setCancelLoading(true);
    try {
      await itemsAPI.cancelSwapRequest(cancelingItemId);
      alert('Swap request cancelled successfully.');
      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
      // Refresh page to update item statuses
      window.location.reload();
    } catch (err) {
      console.error('Error cancelling swap request:', err);
      alert(err.message || 'Failed to cancel swap request');
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
      setCancelingRequestId(null);
      setCancelingItemId(null);
    }
  };

  const openCancelConfirm = (itemId, requestId, itemTitle) => {
    setCancelingItemId(itemId);
    setCancelingRequestId(requestId);
    setShowCancelConfirm(true);
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
                    {/* Item Image - Clickable */}
                    <div 
                      onClick={() => router.push(`/product/${request.item?.id}`)}
                      className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={itemImage}
                        alt={request.item?.title || 'Item'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <h3 
                        onClick={() => router.push(`/product/${request.item?.id}`)}
                        className="heading-primary text-lg font-semibold mb-2 cursor-pointer hover:text-swapcircle-primary transition-colors"
                      >
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
                pending: {
                  bg: theme.colors.pending,
                  text: theme.colors.pendingText,
                  label: 'Pending',
                },
                approved: {
                  bg: '#DCFCE7',
                  text: '#166534',
                  label: 'Approved',
                },
                rejected: {
                  bg: '#FEE2E2',
                  text: '#991B1B',
                  label: 'Rejected',
                },
                cancelled: {
                  bg: '#F3F4F6',
                  text: '#374151',
                  label: 'Cancelled',
                },
              };

              const statusInfo = statusColors[request.status] || statusColors.pending;

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image - Clickable */}
                    <div 
                      onClick={() => router.push(`/product/${request.item?.id}`)}
                      className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={itemImage}
                        alt={request.item?.title || 'Item'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 
                          onClick={() => router.push(`/product/${request.item?.id}`)}
                          className="heading-primary text-lg font-semibold cursor-pointer hover:text-swapcircle-primary transition-colors"
                        >
                          {request.item?.title || 'Unknown Item'}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text,
                          }}
                        >
                          {statusInfo.label}
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
                        {request.status === 'cancelled' && (
                          <p className="text-gray-600 mt-2">
                            Swap request was cancelled.
                          </p>
                        )}
                      </div>

                      {/* Cancel Button - Only for pending requests */}
                      {request.status === 'pending' && (
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              openCancelConfirm(
                                request.item_id,
                                request.id,
                                request.item?.title
                              )
                            }
                            className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="heading-primary text-xl font-bold mb-2">Cancel Swap Request?</h2>
            <p className="text-swapcircle-secondary mb-6">
              Are you sure you want to cancel this swap request? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary flex-1 py-2"
              >
                Keep It
              </button>
              <button
                onClick={handleCancelRequest}
                disabled={cancelLoading}
                className="btn-primary flex-1 py-2 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}