'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLocationDot } from 'react-icons/fa6';
import { useAuth } from '@/contexts/AuthContext';
import { PLACEHOLDER_IMAGE_URL } from '@/config/constants';
import Footer from './Footer';
import SwapSuccessModal from './SwapSuccessModal';
import SwapProcessingModal from './SwapProcessingModal';
import AuthModal from './AuthModal';
import ShareModal from './ShareModal';
import ReportModal from './ReportModal';
import { itemsAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';
import Toast from './Toast';
import RatingDisplay from './RatingDisplay';
import { theme } from '@/styles/theme';
import { useSellerInfo } from '@/hooks/useSellerInfo';
import { useFavoriteStatus } from '@/hooks/useFavoriteStatus';

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [processingActionType, setProcessingActionType] = useState('request'); // 'request', 'cancel'
  const [userCredits, setUserCredits] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [productStatus, setProductStatus] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  // Transform backend product data to component format
  const transformProduct = (productData) => {
    if (!productData) return null;

    // Get metadata (prefers direct fields, falls back to parsing description for old items)
    const metadata = getItemMetadata(productData);

    const images = productData.images && productData.images.length > 0
      ? productData.images.map(img => getImageUrl(img))
      : [PLACEHOLDER_IMAGE_URL];
    
    return {
      id: productData.id,
      title: productData.title,
      condition: metadata.condition || 'Like New',
      brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
      size: metadata.size || 'M',
      location: metadata.location || null,
      description: metadata.mainDescription,
      credits: metadata.credits || 2,
      images: images,
      owner_id: productData.owner_id,
      status: productData.status || 'available', // available, pending, swapped, locked
    };
  };

  const productData = transformProduct(product);

  // Track product status locally for real-time updates
  useEffect(() => {
    if (productData) {
      setProductStatus(productData.status);
    }
  }, [productData]);

  // Check if current user is the owner
  const isOwner = user && productData?.owner_id && user.id === productData.owner_id;

  // Fetch seller info and rating stats via hook
  const { seller, sellerRatingStats } = useSellerInfo(productData?.owner_id);

  // Get user credits
  useEffect(() => {
    if (user) {
      setUserCredits(user.credits || 0);
    }
  }, [user]);

  const { isFavorited, isUpdatingFavorite, toggleFavorite } = useFavoriteStatus(
    productData?.id,
    user,
    isAuthenticated,
  );

  const handleFavorite = async () => {
    if (!isAuthenticated || !user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const result = await toggleFavorite();
      if (result?.success) {
        const message = result.action === 'added' ? 'Added to favorites' : 'Removed from favorites';
        setToastMessage(message);
        setToastType('favorite');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      setToastMessage('Failed to update favorite');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteItem = async () => {
    setDeleteLoading(true);
    try {
      await itemsAPI.deleteItem(productData.id);
      
      // 🔑 KEY FIX: Refresh user to update AuthContext (Header will re-render immediately)
      if (refreshUser) {
        await refreshUser();
      }
      
      // Show success modal
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);

      // Auto-dismiss after 8 seconds and redirect
      setTimeout(() => {
        router.push('/profile?tab=listings');
      }, 8000);
    } catch (error) {
      console.error('Error deleting item:', error);
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setToastMessage(error.message || 'Failed to delete item');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (!productData) {
    return (
      <div className="min-h-screen bg-swapcircle-white flex items-center justify-center">
        <p className="text-swapcircle-secondary">Product not found</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productData.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productData.images.length) % productData.images.length);
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleSwapClick = async () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    // Prevent swapping own items (double check on frontend)
    if (isOwner) {
      setToastMessage('You cannot swap your own items');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Check if item is available
    if (productStatus && productStatus !== 'available' && productStatus !== 'pending') {
      setToastMessage('This item is no longer available for swap');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      // Show processing modal
      setShowProcessingModal(true);
      setProcessingStatus('processing');
      setProcessingActionType('request');

      // Call the swap request API endpoint
      const result = await itemsAPI.requestSwap(productData.id);
      
      // Refresh user data to get updated credits
      if (refreshUser) {
        await refreshUser();
      }
      
      // Show success modal after a brief delay
      setTimeout(() => {
        setProcessingStatus('success');
      }, 2000);

      // Update product status locally
      setProductStatus('pending');
    } catch (error) {
      console.error('Error requesting swap:', error);
      setShowProcessingModal(false);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to request swap';
      setToastMessage(errorMessage.includes('enough credits') ? 'Not enough credits' : errorMessage);
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleProcessingModalClose = () => {
    setShowProcessingModal(false);
    if (processingStatus === 'success') {
      // Refresh page after successful swap request
      window.location.reload();
    }
  };

  const handleCancelSwap = async () => {
    setCancelLoading(true);
    setShowCancelConfirm(false);
    
    try {
      // Show processing modal
      setShowProcessingModal(true);
      setProcessingStatus('processing');
      setProcessingActionType('cancel');

      await itemsAPI.cancelSwapRequest(productData.id);
      
      // Show success modal after a brief delay
      setTimeout(() => {
        setProcessingStatus('success');
      }, 2000);

      // Update product status back to available
      setProductStatus('available');
    } catch (error) {
      console.error('Error cancelling swap:', error);
      setProcessingStatus('error');
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-swapcircle-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-4 bg-swapcircle-alt">
              <img
                src={productData.images[currentImageIndex]}
                alt={productData.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE_URL;
                }}
              />
              
              {/* Navigation Arrows */}
              {productData.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {productData.images.length > 1 && (
              <div className="flex space-x-2">
                {productData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-1 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-colors bg-swapcircle-alt ${
                      index === currentImageIndex ? 'border-swapcircle-primary' : 'border-transparent opacity-50'
                    }`}
                  >
                    <img
                      src={productData.images[index]}
                      alt={`${productData.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE_URL;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="heading-primary text-4xl font-bold">
              {productData.title}
            </h1>

            {/* Attributes */}
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-md text-sm font-medium border border-black text-black bg-white">
                {productData.condition}
              </span>
              <span className="px-3 py-1 rounded-md text-sm font-medium border border-black text-black bg-white">
                Size: {productData.size}
              </span>
              <span className="px-3 py-1 rounded-md text-sm font-medium border border-black text-black bg-white">
                Brand: {productData.brand}
              </span>
              {productData.location && (
                <span className="px-3 py-1 rounded-md text-sm font-medium border border-black text-black bg-white flex items-center gap-1">
                  <FaLocationDot aria-label="location" className="w-4 h-4" />
                  <span>{productData.location}</span>
                </span>
              )}
            </div>

            {/* About Section */}
            <div>
              <h2 className="heading-primary text-xl font-semibold mb-2">About this item</h2>
              <p className="text-swapcircle-secondary text-base leading-relaxed">
                {productData.description}
              </p>
            </div>

            {/* Credits Section */}
            <div className="card-swapcircle border-2 rounded-lg p-6 border-swapcircle">
              <h3 className="heading-primary text-lg font-semibold mb-4">Cost to acquire:</h3>
              <div className="flex items-center justify-between mb-6">
                <p className="text-swapcircle-secondary text-sm">
                  You have {userCredits} credits available
                </p>
                <div className="flex items-center">
                  <p className="text-swapcircle-blue text-3xl font-bold">
                    {productData.credits} {productData.credits === 1 ? 'Credit' : 'Credits'}
                  </p>
                </div>
              </div>

              {/* PENDING STATUS - SINGLE BOX WITH TAP TO CANCEL */}
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <button 
                    className="btn-primary w-full py-4 text-lg"
                    onClick={handleSwapClick}
                  >
                    Request Swap
                  </button>
                  <p className="text-sm text-swapcircle-tertiary text-center">
                    Please log in to request a swap
                  </p>
                </div>
              ) : isOwner ? (
                <div className="space-y-3">
                  <button 
                    className="btn-secondary w-full py-4 text-lg cursor-not-allowed opacity-50"
                    disabled
                  >
                    Your Item
                  </button>
                  <p className="text-sm text-swapcircle-tertiary text-center">
                    You cannot swap your own items
                  </p>
                </div>
              ) : productStatus === 'pending' ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelLoading}
                  className="w-full space-y-2 group disabled:opacity-50 cursor-pointer"
                >
                  {/* Pending Status Box */}
                  <div
                    className="w-full py-2 text-lg font-semibold rounded-lg flex items-center justify-center transition-all group-hover:shadow-md"
                    style={{
                      backgroundColor: theme.colors.pending,
                      color: theme.colors.pendingText,
                    }}
                  >
                    {cancelLoading ? 'Cancelling...' : 'Pending Request'}
                  </div>
                  {/* Tap to Cancel Text */}
                  <p className="text-sm text-swapcircle-tertiary text-center group-hover:text-swapcircle-secondary transition-colors">
                    Tap to cancel
                  </p>
                </button>
              ) : productStatus === 'swapped' || productStatus === 'locked' ? (
                <div className="space-y-3">
                  <button 
                    className="btn-secondary w-full py-4 text-lg cursor-not-allowed opacity-50"
                    disabled
                  >
                    Unavailable
                  </button>
                  <p className="text-sm text-swapcircle-tertiary text-center">
                    This item is no longer available
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50"
                    onClick={handleSwapClick}
                    disabled={userCredits < productData.credits}
                  >
                    Request Swap
                  </button>
                  {userCredits < productData.credits && (
                    <p className="text-sm text-swapcircle-tertiary text-center">
                      Not enough credits to request this item
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Seller Section */}
            {seller && !isOwner && (
              <div className="card-swapcircle border-2 rounded-lg p-6 border-swapcircle">
                <h3 className="heading-primary text-lg font-semibold mb-4">Seller</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-swapcircle-primary flex items-center justify-center overflow-hidden">
                    {seller.profile_pic ? (
                      <img
                        src={getImageUrl({ url: seller.profile_pic })}
                        alt={seller.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <span className={`text-white text-2xl font-bold ${seller.profile_pic ? 'hidden' : ''}`}>
                      {seller.avatar}
                    </span>
                  </div>
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {seller.username ? (
                        <a
                          href={`/profile/${seller.username}`}
                          className="heading-primary text-lg font-semibold hover:text-swapcircle-primary hover:underline block"
                        >
                          {seller.name}
                        </a>
                      ) : (
                        <p className="heading-primary text-lg font-semibold">{seller.name}</p>
                      )}
                      <RatingDisplay 
                        averageRating={sellerRatingStats.average_rating} 
                        totalRatings={sellerRatingStats.total_ratings} 
                      />
                    </div>
                      {seller.location && (
                        <p className="text-swapcircle-secondary text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                          {seller.location}
                        </p>
                      )}
                  </div>
                </div>
                {seller.username && (
                  <a
                    href={`/profile/${seller.username}`}
                    className="btn-secondary w-full text-center block"
                  >
                    View Profile
                  </a>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isOwner ? (
                <>
                  <button 
                    onClick={() => router.push(`/product/${productData.id}/edit`)}
                    className="btn-primary flex-1 py-3 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Item</span>
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleFavorite}
                    disabled={isUpdatingFavorite}
                    className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2"
                  >
                    <svg className={`w-5 h-5 ${isFavorited ? 'icon-primary' : 'icon-primary'}`} fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{isFavorited ? 'Saved' : 'Save'}</span>
                  </button>
                  <button className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2" onClick={()=>setShowShareModal(true)}>
                    <svg className="w-5 h-5 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2" onClick={()=>setShowReportModal(true)}>
                    <svg className="w-5 h-5 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    <span>Report</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
            {/* Logo circles */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="relative w-7 h-7 rounded-full border-3 border-swapcircle-primary -mr-2 z-10" />
              <div className="relative w-7 h-7 rounded-full border-3 -ml-2 z-0" style={{ borderColor: '#0F0F0F' }} />
            </div>

            <h2 className="heading-primary text-xl font-bold text-center mb-2">Delete Item?</h2>
            <p className="text-swapcircle-secondary text-center mb-8 text-sm leading-relaxed">
              Are you sure you want to delete <strong>{productData.title}</strong>? This action cannot be undone and the item will be removed from all listings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1 py-2.5 disabled:opacity-50 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50 transition-opacity"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center">
            {/* Logo circles */}
            <div className="relative flex items-center mb-6">
              <div className="relative w-7 h-7 rounded-full border-3 border-swapcircle-primary -mr-2 z-10" />
              <div className="relative w-7 h-7 rounded-full border-3 -ml-2 z-0" style={{ borderColor: '#0F0F0F' }} />
            </div>

            <h2 className="heading-primary text-lg font-bold text-center mb-1">Item Deleted!</h2>
            <p className="text-swapcircle-secondary text-center text-xs mb-4">
              Your item has been removed from all listings
            </p>

            <button
              onClick={() => router.push('/profile?tab=listings')}
              className="btn-primary px-6 py-1.5 text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="heading-primary text-xl font-bold mb-2">Cancel Swap Request?</h2>
            <p className="text-swapcircle-secondary mb-6">
              Are you sure you want to cancel your swap request for <strong>{productData.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="btn-secondary flex-1 py-2"
              >
                Keep It
              </button>
              <button
                onClick={handleCancelSwap}
                disabled={cancelLoading}
                className="btn-primary flex-1 py-2 disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SwapSuccessModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />

      <SwapProcessingModal
        isOpen={showProcessingModal}
        status={processingStatus}
        actionType={processingActionType}
        onClose={handleProcessingModalClose}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={(info)=>{ setShowShareModal(false); if(info?.copied){ setToastMessage('Link copied'); setToastType('success'); setShowToast(true); } }}
        itemTitle={productData.title}
        itemUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <ReportModal
        isOpen={showReportModal}
        onClose={(info)=>{ setShowReportModal(false); if(info?.success){ setToastMessage('Report submitted'); setToastType('success'); setShowToast(true); } }}
        targetType="item"
        targetId={productData.id}
        itemUrl={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
}