'use client';

import { useState, useEffect } from 'react';
import { ratingAPI } from '@/services/api';

/**
 * StarRating Component
 * 
 * Interactive star rating widget (1-5 stars) for rating users.
 * Shows current rating if user has already rated.
 * Allows clicking stars to set/update rating.
 */
export default function StarRating({ ratedUserId, onRatingChange }) {
  const [currentRating, setCurrentRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current user's rating for this user
  useEffect(() => {
    const fetchMyRating = async () => {
      try {
        const rating = await ratingAPI.getMyRating(ratedUserId);
        if (rating && rating.stars) {
          setCurrentRating(rating.stars);
        }
      } catch (err) {
        // User hasn't rated yet or error - that's okay
        console.log('No existing rating found');
      }
    };

    if (ratedUserId) {
      fetchMyRating();
    }
  }, [ratedUserId]);

  const handleStarClick = async (stars) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      await ratingAPI.giveRating(ratedUserId, stars);
      setCurrentRating(stars);
      
      // Notify parent component of rating change
      if (onRatingChange) {
        onRatingChange(stars);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
      console.error('Error submitting rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoveredStar || currentRating || 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={loading}
            className={`
              text-2xl transition-all duration-150
              ${star <= displayRating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
            `}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
        {currentRating && (
          <span className="text-sm text-swapcircle-secondary ml-2">
            Your rating: {currentRating} star{currentRating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      {loading && (
        <p className="text-swapcircle-secondary text-sm">Saving...</p>
      )}
    </div>
  );
}

