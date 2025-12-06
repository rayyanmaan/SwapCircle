'use client';

/**
 * ItemCard Component
 * 
 * A reusable component for displaying individual item cards in listings.
 * 
 * TODO: Navigate to product detail page when card is clicked
 * TODO: Wire up real backend data in the future
 * TODO: Implement swap functionality with backend API
 */
export default function ItemCard({
  id,
  title,
  size,
  location,
  credits,
  imageUrl,
  condition,
  onSwapClick,
  isOwner = false,
}) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      {/* Image placeholder */}
      <div className="w-full aspect-square rounded-lg bg-swapcircle-alt mb-4 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h2 className="heading-primary text-xl font-semibold mb-2">
        {title}
      </h2>

      {/* Size and Location */}
      <div className="mb-2">
        <p className="text-swapcircle-secondary text-sm">
          Size: {size}
        </p>
        <p className="text-swapcircle-secondary text-sm">
          Location: {location}
        </p>
      </div>

      {/* Condition */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-swapcircle-alt text-swapcircle-primary">
          {condition}
        </span>
      </div>

      {/* Credits */}
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 icon-credit"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8c-1.657 0-3 .895-3 2 0 1.105 1.343 2 3 2s3-.895 3-2c0-1.105-1.343-2-3-2z" />
        </svg>
        <span className="heading-primary text-lg font-semibold">
          {credits} credits
        </span>
      </div>

      {/* Swap Button */}
      {isOwner ? (
        <button
          className="btn-secondary w-full opacity-50 cursor-not-allowed"
          disabled
        >
          Your Item
        </button>
      ) : (
        <button
          className="btn-primary w-full"
          onClick={onSwapClick}
        >
          View Details
        </button>
      )}
    </div>
  );
}

