'use client';

import { useState } from 'react';
import ListingCard from './ListingCard';

// Mock user data
const mockUser = {
  name: 'Syed Hasnain Mumtaz Naqvi',
  email: 'naqvi@uni.minerva.edu',
  avatar: 'S',
  credits: 0,
  listed: 0,
  swapped: 0,
};

// Mock listings data
const mockListings = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    size: 'Size M',
    credits: 2,
    condition: 'Gently Used',
    timestamp: '2h ago',
  },
  {
    id: 2,
    title: 'Cozy Knit Sweater',
    size: 'Size S',
    credits: 1,
    condition: 'Like New',
    timestamp: '4h ago',
  },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('listings');
  const [user] = useState(mockUser);
  const [listings] = useState(mockListings);
  const [favorites] = useState([]);
  const [swapHistory] = useState([]);

  const getCurrentListings = () => {
    switch (activeTab) {
      case 'listings':
        return listings;
      case 'favorites':
        return favorites;
      case 'history':
        return swapHistory;
      default:
        return listings;
    }
  };

  const currentListings = getCurrentListings();
  const hasListings = currentListings.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="bg-swapcircle-alt rounded-lg p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-swapcircle-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl md:text-4xl font-bold">
                {user.avatar}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="heading-primary text-2xl md:text-3xl font-bold">
                  {user.name}
                </h1>
                <button
                  className="p-1 icon-secondary hover:opacity-70 transition-opacity"
                  aria-label="Edit name"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-swapcircle-secondary mb-3">{user.email}</p>
              <button className="flex items-center gap-1 text-sm link-swapcircle text-swapcircle-secondary">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Add contact info
              </button>
            </div>
          </div>

          {/* List Item Button */}
          <div className="md:flex-shrink-0">
            <a href="/upload" className="btn-primary bg-swapcircle-primary text-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              List Item
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-8 pt-8 border-t border-swapcircle">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-swapcircle-primary mb-1">
                {user.credits}
              </div>
              <div className="text-sm text-swapcircle-tertiary">Credits</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-swapcircle-primary mb-1">
                {user.listed}
              </div>
              <div className="text-sm text-swapcircle-tertiary">Listed</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-swapcircle-primary mb-1">
                {user.swapped}
              </div>
              <div className="text-sm text-swapcircle-tertiary">Swapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-0 mb-0">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'listings'
              ? 'text-swapcircle-primary bg-swapcircle-alt border-t border-l border-r border-swapcircle rounded-t-lg'
              : 'text-swapcircle-secondary hover:text-swapcircle-primary border-b border-swapcircle'
          }`}
        >
          My Listings
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-swapcircle-primary bg-swapcircle-alt border-t border-l border-r border-swapcircle rounded-t-lg'
              : 'text-swapcircle-secondary hover:text-swapcircle-primary border-b border-swapcircle'
          }`}
        >
          Favorites
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-swapcircle-primary bg-swapcircle-alt border-t border-l border-r border-swapcircle rounded-t-lg'
              : 'text-swapcircle-secondary hover:text-swapcircle-primary border-b border-swapcircle'
          }`}
        >
          Swap History
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-swapcircle-alt rounded-lg p-6 md:p-8 min-h-[400px]">
        {hasListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {/* Box Icon - Isometric style */}
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric box */}
                <path
                  d="M20 50 L50 30 L80 50 L50 70 Z"
                  fill="#8B4513"
                  opacity="0.3"
                />
                <path
                  d="M50 30 L80 50 L80 80 L50 100 Z"
                  fill="#8B4513"
                  opacity="0.5"
                />
                <path
                  d="M20 50 L50 70 L50 100 L20 80 Z"
                  fill="#8B4513"
                  opacity="0.4"
                />
                <path
                  d="M20 50 L50 30 L50 70 Z"
                  stroke="#8B4513"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M50 30 L80 50 L50 70 Z"
                  stroke="#8B4513"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M50 70 L50 100 L20 80 L20 50 Z"
                  stroke="#8B4513"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M50 70 L80 50 L80 80 L50 100 Z"
                  stroke="#8B4513"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <h3 className="heading-primary text-xl font-bold mb-2">
              No listings yet
            </h3>
            <p className="text-swapcircle-secondary mb-6">
              Start listing items to earn credits
            </p>
            <a href="/upload" className="btn-primary bg-swapcircle-primary text-white">
              List Your First Item
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

