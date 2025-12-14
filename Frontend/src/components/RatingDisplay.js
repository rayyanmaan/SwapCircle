'use client';

/**
 * RatingDisplay Component
 * 
 * Displays average rating and total count for a user.
 * Format: "X.X ⭐ (N ratings)" or "X.X ⭐ (1 rating)"
 */
export default function RatingDisplay({ averageRating, totalRatings }) {
  if (!averageRating || totalRatings === 0) {
    return (
      <span className="text-swapcircle-secondary text-sm">
        No ratings yet
      </span>
    );
  }

  const ratingText = totalRatings === 1 
    ? `${averageRating.toFixed(1)} ⭐ (1 rating)`
    : `${averageRating.toFixed(1)} ⭐ (${totalRatings} ratings)`;

  return (
    <span className="text-swapcircle-secondary text-sm flex items-center gap-1">
      <span>{ratingText}</span>
    </span>
  );
}

