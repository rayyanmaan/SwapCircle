'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLocationDot } from 'react-icons/fa6';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Toast from './Toast';
import AuthModal from './AuthModal';

export default function ListingCard({
  id,
  image,
  title,
  size,
  credits,
  condition,
  location,
  timestamp,
  status,
  showSwappedStatus = false,
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Check if item is in user's favorites on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        const response = await userAPI.getFavorites(user.id);
        const favoriteIds = response.favorites || [];
        setIsFavorited(favoriteIds.includes(id));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, user, id]);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    if (isUpdating) {
      return;
    }

    setIsUpdating(true);
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);

    try {
      if (newFavoriteState) {
        await userAPI.addFavorite(user.id, id);
        setToastMessage('Added to favorites');
        setToastType('favorite');
        setShowToast(true);
      } else {
        await userAPI.removeFavorite(user.id, id);
        setToastMessage('Removed from favorites');
        setToastType('favorite');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      setIsFavorited(!newFavoriteState);
      setToastMessage('Failed to update favorite');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/product/${id}`);
  };

  // Unavailable items should appear faded; status is normalized upstream to
  // 'available' | 'unavailable' | 'pending'. Keep fade for 'unavailable'.
  const isUnavailable = status === 'unavailable';
  const isPending = status === 'pending';
  // faded items should include both unavailable (swapped/locked) and
  // pending (requested but unresolved) so they look visually subdued
  const isFaded = isUnavailable || isPending;

  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={handleCardClick}>
      <a href={`/product/${id}`} className={`group ${isFaded ? 'listing-unavailable' : ''}`}>
        <div className={`relative overflow-hidden rounded-lg aspect-square bg-swapcircle-alt`} title={isUnavailable ? 'Unavailable' : undefined}>
        {/* Image with gradient overlay */}
        {image && image !== '/api/placeholder/300' ? (
          <div className={`${isFaded ? '' : 'absolute inset-0 group-hover:scale-105'} absolute inset-0 transition-transform duration-300`}>

            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(to bottom right, var(--swapcircle-neutral-200), var(--swapcircle-neutral-100))';
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(37, 99, 235, 0.2), transparent)' }}></div>
          </div>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br"
            style={{ background: 'linear-gradient(to bottom right, var(--swapcircle-neutral-200), var(--swapcircle-neutral-100))' }}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(37, 99, 235, 0.2), transparent)' }}></div>
          </div>
        )}

        {/* Condition badge or Swapped status badge */}
        {showSwappedStatus && status === "swapped" ? (
          <div className="absolute top-2 left-2 bg-gray-200 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-800">Swapped</span>
          </div>
        ) : condition && !showSwappedStatus ? (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-swapcircle-primary">{condition}</span>
          </div>
        ) : null}

        {/* Centered status overlay for Pending / Unavailable badges.
            These should be centered over the image and stacked with a
            small gap when both are present (rare). */}
        {(isPending || isUnavailable) && (
          <>
            {/* Dark overlay sits under badges so badges remain fully opaque */}
            <div className="absolute inset-0 unavailable-overlay pointer-events-none" aria-hidden="true"></div>

            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                {isUnavailable && (
                  <div className="backdrop-blur-sm px-3 py-1 rounded-full bg-gray-100/80">
                    <span className="text-xs font-medium text-gray-700">Unavailable</span>
                  </div>
                )}

                {isPending && (
                  <div className="backdrop-blur-sm px-3 py-1 rounded-full bg-amber-100">
                    <span className="text-xs font-medium text-amber-800">Pending</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Heart icon */}
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors z-10"
            aria-label="Favorite"
          >
            <svg
              className={`w-5 h-5 transition-colors ${isFavorited ? 'icon-primary' : 'icon-secondary'}`}
              fill={isFavorited ? 'currentColor' : 'none'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </a>

      {/* Product Details */}
      <div className="mt-3 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="heading-primary font-semibold text-sm truncate transition-colors">
            {title}
          </h3>
          <div className="shrink-0">
            <div className="px-2.5 py-1 rounded-md bg-swapcircle-alt text-swapcircle-primary text-sm font-semibold leading-none">
              {credits}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-swapcircle-secondary text-sm">
          <span className="truncate">{size}</span>

          {location && (
            <span className="flex items-center gap-1 ml-3">
              <FaLocationDot aria-label="location" className="w-4 h-4 text-swapcircle-secondary" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>
      </div>

      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  );
}
