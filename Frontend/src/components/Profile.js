'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ListingCard from './ListingCard';
import SwapRequests from './SwapRequests';
import SwapHistory from './SwapHistory';
import { useAuth } from '@/contexts/AuthContext';
import { ratingAPI } from '@/services/api';
import { getImageUrl } from '@/utils/itemParser';
import { toListingCardData } from '@/utils/itemTransforms';
import RatingDisplay from './RatingDisplay';
import StarRating from './StarRating';
import { FaLocationDot } from 'react-icons/fa6';
import { useProfileData } from '@/hooks/useProfileData';
import { useFavorites } from '@/hooks/useFavorites';

export default function Profile({ username: usernameProp }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const username = usernameProp || params?.username;
  
  // Get initial tab from URL query parameter, default to 'listings'
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['listings', 'favorites', 'swap-requests', 'history'].includes(tabParam)) {
      return tabParam;
    }
    return 'listings';
  });

  // Update tab when URL query parameter changes
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['listings', 'favorites', 'swap-requests', 'history'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const { user, setUser, listings, swapHistory, ratingStats, setRatingStats, loading, error, isOwnProfile } = useProfileData(
    username,
    isAuthenticated,
    authUser,
  );

  const { favorites, loadingFavorites } = useFavorites({
    enabled: isOwnProfile && isAuthenticated && !!authUser,
    userId: authUser?.id,
    activeTab,
  });




  const getSocialLink = (platform, value) => {
    if (!value) return null;

    const links = {
      instagram: `https://instagram.com/${value.replace('@', '')}`,
      whatsapp: `https://wa.me/${value.replace(/[^0-9]/g, '')}`,
      facebook: value.startsWith('http') ? value : `https://facebook.com/${value}`,
      twitter: `https://twitter.com/${value.replace('@', '')}`,
      linkedin: value.startsWith('http') ? value : `https://linkedin.com/in/${value}`,
    };

    return links[platform] || value;
  };

  const listingCards = listings;

  const favoriteCards = favorites;

  const getCurrentListings = () => {
    switch (activeTab) {
      case 'listings':
        return listingCards;
      case 'favorites':
        return favoriteCards;
      case 'history':
        return swapHistory;
      default:
        return listingCards;
    }
  };

  const currentListings = getCurrentListings();
  const hasListings = currentListings.length > 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
        <div className="text-center py-4">
          <Link href="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-swapcircle-secondary mb-4">User not found</p>
          <Link href="/" className="btn-primary">Go to Home</Link>
        </div>
      </div>
    );
  }

  const hasSocialLinks = user.instagram_handle || user.whatsapp_number || 
                         user.facebook_url || user.twitter_handle || user.linkedin_url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header Card */}
      <div className="bg-swapcircle-alt rounded-lg p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-swapcircle-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profile_pic && getImageUrl({ url: user.profile_pic }) ? (
                  <img
                    src={getImageUrl({ url: user.profile_pic })}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <span className={`text-white text-3xl md:text-4xl font-bold ${user.profile_pic && getImageUrl({ url: user.profile_pic }) ? 'hidden' : ''}`}>
                  {user.avatar}
                </span>
              </div>
              {/* Settings Button - Only show on own profile */}
              {isOwnProfile && (
                <a
                  href="/settings"
                  className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                >
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Edit Profile
                </a>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="heading-primary text-2xl md:text-3xl font-bold">
                  {user.name}
                </h1>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-swapcircle-secondary">@{user.username}</p>
                <RatingDisplay 
                  averageRating={ratingStats.average_rating} 
                  totalRatings={ratingStats.total_ratings} 
                />
              </div>
              {user.location && (
                <span className="text-swapcircle-secondary text-sm flex items-center gap-1 mb-2">
                  <FaLocationDot className="w-4 h-4" />
                  {user.location}
                </span>
              )}
              {isOwnProfile && (
                <p className="text-swapcircle-secondary mb-3">{user.email}</p>
              )}
              {!isOwnProfile && isAuthenticated && (
                <div className="mb-3">
                  <StarRating 
                    ratedUserId={user.id}
                    onRatingChange={(stars) => {
                      // Refresh rating stats after rating
                      ratingAPI.getRatingStats(user.id).then(stats => {
                        setRatingStats(stats);
                      }).catch(err => console.error('Error fetching rating stats:', err));
                    }}
                  />
                </div>
              )}
              
              {/* Bio */}
              {user.bio && (
                <p className="text-swapcircle-secondary mb-3 leading-relaxed max-w-2xl">
                  {user.bio}
                </p>
              )}
              
              {/* Social Media Links */}
              {hasSocialLinks && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {user.instagram_handle && (
                    <a
                      href={getSocialLink('instagram', user.instagram_handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-swapcircle-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  {user.whatsapp_number && (
                    <a
                      href={getSocialLink('whatsapp', user.whatsapp_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-swapcircle-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  {user.facebook_url && (
                    <a
                      href={getSocialLink('facebook', user.facebook_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-swapcircle-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  {user.twitter_handle && (
                    <a
                      href={getSocialLink('twitter', user.twitter_handle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-swapcircle-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a
                      href={getSocialLink('linkedin', user.linkedin_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-swapcircle-primary hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List Item Button - Only show on own profile */}
          {isOwnProfile && (
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
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-8 pt-8 border-t border-swapcircle">
          <div className={`grid ${isOwnProfile ? 'grid-cols-3' : 'grid-cols-2'} gap-6`}>
            {/* Only show credits on own profile for privacy */}
            {isOwnProfile && (
              <div className="text-center md:text-left">
                <div className="text-3xl md:text-4xl font-bold text-swapcircle-primary mb-1">
                  {user.credits}
                </div>
                <div className="text-sm text-swapcircle-tertiary">Credits</div>
              </div>
            )}
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
          {isOwnProfile ? 'My Listings' : 'Listings'}
        </button>
        {isOwnProfile && (
          <>
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
              onClick={() => setActiveTab('swap-requests')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'swap-requests'
                  ? 'text-swapcircle-primary bg-swapcircle-alt border-t border-l border-r border-swapcircle rounded-t-lg'
                  : 'text-swapcircle-secondary hover:text-swapcircle-primary border-b border-swapcircle'
              }`}
            >
              Swap Requests
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
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-swapcircle-alt rounded-lg p-6 md:p-8 min-h-[400px]">
        {activeTab === 'swap-requests' && isOwnProfile ? (
          <SwapRequests />
        ) : activeTab === 'listings' ? (
          hasListings ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
              {isOwnProfile && (
                <>
                  <p className="text-swapcircle-secondary mb-6">
                    Start listing items to earn credits
                  </p>
                  <a href="/upload" className="btn-primary bg-swapcircle-primary text-white">
                    List Your First Item
                  </a>
                </>
              )}
            </div>
          )
        ) : activeTab === 'favorites' && isOwnProfile ? (
          loadingFavorites ? (
            <div className="text-center py-12">
              <p className="text-swapcircle-secondary">Loading favorites...</p>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-swapcircle-secondary">No favorites yet.</p>
            </div>
          )
        ) : activeTab === 'history' && isOwnProfile ? (
          <SwapHistory />
        ) : null}
      </div>
    </div>
  );
}
