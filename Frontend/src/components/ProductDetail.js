'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from './Footer';
import SwapSuccessModal from './SwapSuccessModal';
import AuthModal from './AuthModal';
import { userAPI, itemsAPI } from '@/services/api';
import { getItemMetadata, getImageUrl } from '@/utils/itemParser';

export default function ProductDetail({ product }) {
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [seller, setSeller] = useState(null);
  const [userCredits, setUserCredits] = useState(0);

  // Transform backend product data to component format
  const transformProduct = (productData) => {
    if (!productData) return null;

    // Get metadata (prefers direct fields, falls back to parsing description for old items)
    const metadata = getItemMetadata(productData);

    const images = productData.images && productData.images.length > 0
      ? productData.images.map(img => getImageUrl(img))
      : ['/placeholder.svg'];
    
    return {
      id: productData.id,
      title: productData.title,
      condition: metadata.condition || 'Like New',
      brand: metadata.branded === 'Yes' ? 'Branded' : 'Unknown',
      size: metadata.size || 'M',
      description: metadata.mainDescription,
      credits: metadata.credits || 2,
      images: images,
      owner_id: productData.owner_id,
      status: productData.status || 'available', // available, pending, swapped, locked
    };
  };

  const productData = transformProduct(product);

  // Check if current user is the owner
  const isOwner = user && productData?.owner_id && user.id === productData.owner_id;

  // Fetch seller information if owner_id is available
  useEffect(() => {
    const fetchSeller = async () => {
      if (productData?.owner_id) {
        try {
          const sellerData = await userAPI.getUser(productData.owner_id);
          setSeller({
            name: sellerData.full_name || sellerData.username || 'Unknown',
            username: sellerData.username,
            avatar: sellerData.avatar || sellerData.username?.[0]?.toUpperCase() || '?',
            credits: sellerData.credits || 0,
            lockDuration: '48 hours',
          });
        } catch (err) {
          console.error('Error fetching seller:', err);
          setSeller({
            name: 'Unknown',
            username: null,
            avatar: '?',
            credits: 0,
            lockDuration: '48 hours',
          });
        }
      }
    };

    fetchSeller();
  }, [productData?.owner_id]);

  // Get user credits
  useEffect(() => {
    if (user) {
      setUserCredits(user.credits || 0);
    }
  }, [user]);

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
      alert('You cannot swap your own items');
      return;
    }

    // Check if item is available
    if (product?.status && product.status !== 'available' && product.status !== 'pending') {
      alert('This item is no longer available for swap');
      return;
    }

    try {
      // Call the swap request API endpoint
      const result = await itemsAPI.requestSwap(productData.id);
      // Show success modal with request message
      alert(result.message || 'Swap request created! Waiting for owner approval.');
      setShowSwapModal(true);
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error requesting swap:', error);
      alert(error.message || 'Failed to request swap. Please try again.');
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
                    e.target.src = '/placeholder.svg';
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
                        e.target.src = '/placeholder.svg';
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
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                {productData.condition}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-swapcircle-credit text-swapcircle-credit">
                Brand: {productData.brand}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#FEF3C7', color: '#F59E0B' }}>
                Size: {productData.size}
              </span>
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
                <div className="flex items-center gap-2">
                  <svg
                    className="w-6 h-6 icon-credit"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M12 8c-1.657 0-3 .895-3 2 0 1.105 1.343 2 3 2s3-.895 3-2c0-1.105-1.343-2-3-2z" />
                  </svg>
                  <p className="text-swapcircle-blue text-4xl font-bold">
                    {productData.credits} Credits
                  </p>
                </div>
              </div>
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
              ) : productData?.status === 'pending' ? (
                <div className="space-y-3">
                  <button 
                    className="btn-secondary w-full py-4 text-lg cursor-not-allowed opacity-50"
                    disabled
                  >
                    Pending Request
                  </button>
                  <p className="text-sm text-swapcircle-tertiary text-center">
                    This item has a pending swap request
                  </p>
                </div>
              ) : productData?.status === 'swapped' || productData?.status === 'locked' ? (
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
                <button 
                  className="btn-primary w-full py-4 text-lg"
                  onClick={handleSwapClick}
                >
                  Request Swap
                </button>
              )}
            </div>

            {/* Seller Section */}
            {seller && (
              <div className="card-swapcircle border-2 rounded-lg p-6 border-swapcircle">
                <h3 className="heading-primary text-lg font-semibold mb-4">Seller</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-swapcircle-primary flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{seller.avatar}</span>
                  </div>
                  <div className="flex-1">
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
                    <p className="text-swapcircle-secondary text-sm">
                      {seller.credits} credits • {seller.lockDuration} lock
                    </p>
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
              <button className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Save</span>
              </button>
              <button className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      <SwapSuccessModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}
