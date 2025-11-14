'use client';

/**
 * ListingPage Component
 * 
 * A skeleton component for displaying individual listing details.
 * Based on the listing page design specification.
 * 
 * TODO: Add props for listing data (id, title, description, images, credits, etc.)
 * TODO: Implement image gallery/carousel functionality
 * TODO: Add seller information section
 * TODO: Connect to backend API for fetching listing data
 * TODO: Implement swap/request button functionality
 * TODO: Add loading and error states
 */
export default function ListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Photo Section */}
      <div className="mb-6">
        {/* TODO: Replace with actual image component/gallery */}
        <div 
          className="w-full aspect-square rounded-lg bg-gradient-to-br from-pink-100 to-purple-100"
          style={{ backgroundColor: '#fdf2f8' }}
        >
          {/* Placeholder for product photo */}
          <div className="flex items-center justify-center h-full text-gray-400">
            Product Photo
          </div>
        </div>
      </div>

      {/* Title Section */}
      <div className="mb-4">
        {/* TODO: Replace with actual title from props */}
        <h1 className="text-2xl font-bold" style={{ color: '#1e1b4b' }}>
          Product Title
        </h1>
      </div>

      {/* Description Section */}
      <div className="mb-6">
        {/* TODO: Replace with actual description from props */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold" style={{ color: '#1e1b4b' }}>
            About this item
          </h2>
          <p className="text-gray-600">
            Product description will go here...
          </p>
        </div>
      </div>

      {/* Price/Credit Info Section */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fdf2f8' }}>
        {/* TODO: Replace with actual credit value from props */}
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: '#fbbf24' }}
          >
            <path d="M12 8c-1.657 0-3 .895-3 2 0 1.105 1.343 2 3 2s3-.895 3-2c0-1.105-1.343-2-3-2z" />
          </svg>
          <span className="text-lg font-semibold" style={{ color: '#1e1b4b' }}>
            Credits: 2
          </span>
        </div>
      </div>

      {/* Swap / Request Button Space */}
      <div className="mb-6">
        {/* TODO: Implement swap/request button with proper styling */}
        {/* TODO: Add click handler for swap/request action */}
        {/* TODO: Add loading state during request */}
        {/* TODO: Add disabled state if user doesn't have enough credits */}
        <button
          className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: '#7c3aed' }}
          disabled
        >
          Swap / Request
        </button>
      </div>
    </div>
  );
}

