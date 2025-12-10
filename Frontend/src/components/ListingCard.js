'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Toast from './Toast';

export default function ListingCard({
  id,
  image,
  title,
  size,
  credits,
  condition,
  timestamp,
  status,
  showSwappedStatus = false,
}) {
  const { user, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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
      window.location.href = '/login';
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
    window.location.href = `/product/${id}`;
  };

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="relative overflow-hidden rounded-lg aspect-square bg-swapcircle-alt">
        {/* Image with gradient overlay */}
        {image && image !== '/api/placeholder/300' ? (
          <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-300">
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

        {/* Status badge (Pending) - positioned below swapped/condition badge or top-left if no badge */}
        {status && status === "pending" && (
          <div className={`absolute ${(showSwappedStatus && status === "swapped") || condition ? 'top-10 left-2' : 'top-2 left-2'} backdrop-blur-sm px-2 py-1 rounded-full bg-amber-100`}>
            <span className="text-xs font-medium text-amber-800">
              Pending
            </span>
          </div>
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

      {/* Product Details */}
      <div className="mt-3">
        <h3 className="heading-primary font-semibold text-sm mb-1 line-clamp-2 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-swapcircle-secondary text-sm">{size}</span>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 icon-credit"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8c-1.657 0-3 .895-3-6.378 0 1.364.717 2.617 1.891 3.291L12 8l.109-.087C13.283 7.237 14 5.986 14 4.622 14 1.895 12.657 0 11 0z M14 0c-1.657 0-3 .895-3 6.378 0 1.364.717 2.617 1.891 3.291L14 8l.109-.087C15.283 7.237 16 5.986 16 4.622 16 1.895 14.657 0 13 0z" />
            </svg>
            <span className="text-swapcircle-primary text-sm font-medium">
              {credits}
            </span>
          </div>
        </div>
      </div>
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
}

