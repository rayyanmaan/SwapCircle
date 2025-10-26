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
}) {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <a href={`/product/${id}`} className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg aspect-square" style={{ backgroundColor: '#fdf2f8' }}>
        {/* Image with gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br group-hover:scale-105 transition-transform duration-300"
          style={{
            backgroundImage: image ? `url(${image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: !image ? 'linear-gradient(to bottom right, #fbcfe8, #fce7f3)' : undefined
          }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(147, 51, 234, 0.2), transparent)' }}></div>
        </div>

        {/* Condition badge */}
        {condition && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="text-xs font-medium" style={{ color: '#1e1b4b' }}>{condition}</span>
          </div>
        )}

        {/* Heart icon */}
          <button
            onClick={handleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label="Favorite"
          >
            <svg
              className="w-5 h-5 transition-colors"
              style={{ color: isFavorited ? '#ff006e' : '#7c3aed' }}
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
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 transition-colors" style={{ color: '#1e1b4b' }}>
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: '#7c3aed' }}>{size}</span>
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: '#fbbf24' }}
            >
              <path d="M12 8c-1.657 0-3 .895-3-6.378 0 1.364.717 2.617 1.891 3.291L12 8l.109-.087C13.283 7.237 14 5.986 14 4.622 14 1.895 12.657 0 11 0z M14 0c-1.657 0-3 .895-3 6.378 0 1.364.717 2.617 1.891 3.291L14 8l.109-.087C15.283 7.237 16 5.986 16 4.622 16 1.895 14.657 0 13 0z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#1e1b4b' }}>
              {credits}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

