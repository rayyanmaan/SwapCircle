'use client';

import { useState } from 'react';

export default function ListingCard({
  id,
  image,
  title,
  size,
  credits,
  condition,
  timestamp,
  status,
  showSwappedStatus = false, // If true, show swapped status instead of condition
}) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  // 'pending' should not mark an item as unavailable — pending means it's
  // requested but not yet accepted/rejected. Unavailable covers swapped or
  // locked items which are not available for new swaps.
  const isUnavailable = ['swapped', 'locked'].includes(status);
  const isPending = status === 'pending';
  // faded items should include both unavailable (swapped/locked) and
  // pending (requested but unresolved) so they look visually subdued
  const isFaded = isUnavailable || isPending;

  return (
    <a href={`/product/${id}`} className={`group cursor-pointer ${isFaded ? 'listing-unavailable' : ''}`}>
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
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
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
    </a>
  );
}

