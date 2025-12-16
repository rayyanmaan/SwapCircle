'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { itemsAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/styles/theme';
import ConfirmationModal from './ConfirmationModal';
import SwapProcessingModal from './SwapProcessingModal';

export default function SwapRequests() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [swapRequests, setSwapRequests] = useState({ as_owner: [], as_requester: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states for approve
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [approvingItemId, setApprovingItemId] = useState(null);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);

  // Modal states for reject
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectingItemId, setRejectingItemId] = useState(null);
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);

  // Modal states for cancel
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelingRequestId, setCancelingRequestId] = useState(null);
  const [cancelingItemId, setCancelingItemId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);

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

  // ===== APPROVE HANDLERS =====
  const openApproveConfirm = (itemId, requestId) => {
    setApprovingItemId(itemId);
    setApprovingRequestId(requestId);
    setShowApproveConfirm(true);
  };

  const handleApproveConfirm = async () => {
    if (!approvingItemId || !approvingRequestId) return;

    setApproveLoading(true);
    try {
      await itemsAPI.approveSwapRequest(approvingItemId, approvingRequestId);
      
      // Refresh user data to get updated credits
      if (refreshUser) {
        await refreshUser();
      }

      setShowApproveConfirm(false);
      setShowApproveSuccess(true);

      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
    } catch (err) {
      console.error('Error approving swap request:', err);
      alert(err.message || 'Failed to approve swap request');
      setShowApproveConfirm(false);
    } finally {
      setApproveLoading(false);
      setApprovingItemId(null);
      setApprovingRequestId(null);
    }
  };

  // ===== REJECT HANDLERS =====
  const openRejectConfirm = (itemId, requestId) => {
    setRejectingItemId(itemId);
    setRejectingRequestId(requestId);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingItemId || !rejectingRequestId) return;

    setRejectLoading(true);
    try {
      await itemsAPI.rejectSwapRequest(rejectingItemId, rejectingRequestId);
      
      setShowRejectConfirm(false);
      setShowRejectSuccess(true);

      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
    } catch (err) {
      console.error('Error rejecting swap request:', err);
      alert(err.message || 'Failed to reject swap request');
      setShowRejectConfirm(false);
    } finally {
      setRejectLoading(false);
      setRejectingItemId(null);
      setRejectingRequestId(null);
    }
  };

  // ===== CANCEL HANDLERS =====
  const openCancelConfirm = (itemId, requestId) => {
    setCancelingItemId(itemId);
    setCancelingRequestId(requestId);
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelingItemId || !cancelingRequestId) return;

    setCancelLoading(true);
    try {
      await itemsAPI.cancelSwapRequest(cancelingItemId);
      
      setShowCancelConfirm(false);
      setShowCancelSuccess(true);

      // Refresh swap requests
      const data = await itemsAPI.getSwapRequests();
      setSwapRequests(data);
    } catch (err) {
      console.error('Error cancelling swap request:', err);
      alert(err.message || 'Failed to cancel swap request');
      setShowCancelConfirm(false);
    } finally {
      setCancelLoading(false);
      setCancelingItemId(null);
      setCancelingRequestId(null);
    }
  };

  const handleApproveSuccess = () => {
    setShowApproveSuccess(false);
    // Optionally refresh the page to update item statuses
    window.location.reload();
  };

  const handleRejectSuccess = () => {
    setShowRejectSuccess(false);
    // Optionally refresh the page to update item statuses
    window.location.reload();
  };

  const handleCancelSuccess = () => {
    setShowCancelSuccess(false);
    // Optionally refresh the page to update item statuses
    window.location.reload();
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
              
              const handleItemClick = (e) => {
                // Prevent click if it came from a button
                if (e.target.closest('button')) return;
                router.push(`/product/${request.item?.id}`);
              };
              
              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={handleItemClick}
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image - Clickable */}
                    <div 
                      className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0"
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
                        className="heading-primary text-lg font-semibold mb-2"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openApproveConfirm(request.item_id, request.id);
                          }}
                          className="btn-primary px-6 py-2"
                        >
                          Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRejectConfirm(request.item_id, request.id);
                          }}
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

              const handleItemClick = (e) => {
                // Prevent click if it came from a button
                if (e.target.closest('button')) return;
                router.push(`/product/${request.item?.id}`);
              };

              return (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={handleItemClick}
                >
                  <div className="flex items-start gap-4">
                    {/* Item Image - Clickable */}
                    <div 
                      className="w-24 h-24 rounded-lg overflow-hidden bg-swapcircle-alt flex-shrink-0"
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
                          className="heading-primary text-lg font-semibold"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              openCancelConfirm(request.item_id, request.id);
                            }}
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

      {/* ===== MODALS ===== */}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveConfirm}
        title="Approve Swap Request?"
        message="Are you sure you want to approve this swap request?"
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={handleApproveConfirm}
        onCancel={() => setShowApproveConfirm(false)}
        isLoading={approveLoading}
        variant="default"
      />

      {/* Approve Success Modal */}
      <SwapProcessingModal
        isOpen={showApproveSuccess}
        status="success"
        actionType="request"
        onClose={handleApproveSuccess}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectConfirm}
        title="Reject Swap Request?"
        message="Are you sure you want to reject this swap request? The requester will be notified."
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={handleRejectConfirm}
        onCancel={() => setShowRejectConfirm(false)}
        isLoading={rejectLoading}
        variant="danger"
      />

      {/* Reject Success Modal */}
      <SwapProcessingModal
        isOpen={showRejectSuccess}
        status="success"
        actionType="cancel"
        onClose={handleRejectSuccess}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Cancel Swap Request?"
        message="Are you sure you want to cancel this swap request? This action cannot be undone."
        confirmText="Cancel Request"
        cancelText="Keep It"
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancelConfirm(false)}
        isLoading={cancelLoading}
        variant="danger"
      />

      {/* Cancel Success Modal */}
      <SwapProcessingModal
        isOpen={showCancelSuccess}
        status="success"
        actionType="cancel"
        onClose={handleCancelSuccess}
      />
    </div>
  );
}