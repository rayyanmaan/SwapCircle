'use client';

import { useState, useMemo, useEffect } from 'react';
import Footer from '@/components/Footer';
import ListingsGrid from '@/components/ListingsGrid';
import FilterSidebar from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import { itemsAPI } from '@/services/api';
import { toListingCardData } from '@/utils/itemTransforms';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowsePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    categories: [],
    locations: [],
    conditions: [],
    minCredits: null,
    maxCredits: null,
    availability: 'available', // 'all' | 'available' | 'unavailable' | 'pending'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await itemsAPI.getItems();
        // Show all items on browse page, including unavailable ones (we'll visually indicate them but keep them visible)
        const allItems = Array.isArray(data) ? data : [];
        setListings(allItems);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError(err.message || 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Transform backend items to listing format via shared helper
  const transformListings = (items) => {
    return items.map((item) => {
      const base = toListingCardData(item);
      if (!base) return null;
      const isOwner = user && item.owner_id && user.id === item.owner_id;
      return {
        ...base,
        image: base.image, // ListingCard expects 'image'
        isOwner,
      };
    }).filter(Boolean);
  };

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    const transformedListings = transformListings(listings);
    let filtered = [...transformedListings];

    // Hide own items for logged-in users
    if (user) {
      filtered = filtered.filter((item) => !item.isOwner);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((item) =>
        filters.categories.includes(item.category)
      );
    }

    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      filtered = filtered.filter((item) =>
        item.location && filters.locations.includes(item.location)
      );
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      filtered = filtered.filter((item) =>
        filters.conditions.includes(item.condition)
      );
    }

    // Credits range filter (since all items are 1 credit now, this is less useful but kept for compatibility)
    if (filters.minCredits !== null) {
      filtered = filtered.filter((item) => item.credits >= filters.minCredits);
    }
    if (filters.maxCredits !== null) {
      filtered = filtered.filter((item) => item.credits <= filters.maxCredits);
    }

    // Availability filter (available | unavailable | pending)
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'unavailable') {
        filtered = filtered.filter((item) => item.status === 'unavailable');
      } else if (filters.availability === 'available') {
        filtered = filtered.filter((item) => item.status === 'available');
      } else if (filters.availability === 'pending') {
        filtered = filtered.filter((item) => item.status === 'pending');
      }
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // Sort by ID (newer items typically have higher IDs)
        // If items have created_at, we could sort by that instead
        filtered.sort((a, b) => {
          // Try to sort by ID (assuming newer items have higher IDs)
          // If IDs are not sortable, maintain current order
          if (a.id && b.id) {
            // Compare as strings if they're not numeric
            return b.id.localeCompare(a.id);
          }
          return 0;
        });
        break;
      case 'oldest':
        // Sort by ID (older items typically have lower IDs)
        filtered.sort((a, b) => {
          if (a.id && b.id) {
            return a.id.localeCompare(b.id);
          }
          return 0;
        });
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, filters, sortBy, listings]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      locations: [],
      conditions: [],
      minCredits: null,
      maxCredits: null,
      availability: 'available',
    });
    setSearchQuery('');
  };

  const activeFilterCount =
    filters.categories.length +
    (filters.locations?.length || 0) +
    filters.conditions.length +
    (filters.minCredits !== null ? 1 : 0) +
    (filters.maxCredits !== null ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  return (
    <main className="min-h-screen bg-swapcircle-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="heading-primary text-4xl font-bold mb-2">
            Browse All Items
          </h1>
          <p className="text-swapcircle-secondary text-lg">
            Discover amazing clothing swaps from your campus community
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by item, brand, or category..."
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary lg:hidden flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 icon-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-swapcircle-primary">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="lg:w-48">
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-swapcircle-secondary text-sm font-medium">
                Active filters:
              </span>
              {filters.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-sm bg-white border border-swapcircle text-swapcircle-secondary"
                >
                  {cat}
                </span>
              ))}
              {filters.locations?.map((loc) => (
                <span
                  key={loc}
                  className="px-3 py-1 rounded-full text-sm bg-white border border-swapcircle text-swapcircle-secondary"
                >
                  {loc}
                </span>
              ))}
              {filters.conditions.map((cond) => (
                <span
                  key={cond}
                  className="px-3 py-1 rounded-full text-sm bg-white border border-swapcircle text-swapcircle-secondary"
                >
                  {cond}
                </span>
              ))}
              {(filters.minCredits !== null || filters.maxCredits !== null) && (
                <span className="px-3 py-1 rounded-full text-sm bg-white border border-swapcircle text-swapcircle-secondary">
                  Credits: {filters.minCredits !== null ? filters.minCredits : '0'} -{' '}
                  {filters.maxCredits !== null ? filters.maxCredits : '∞'}
                </span>
              )}
              {filters.availability !== 'all' && (
                <span className="px-3 py-1 rounded-full text-sm bg-white border border-swapcircle text-swapcircle-secondary">
                  {filters.availability === 'available' ? 'Available' : filters.availability === 'pending' ? 'Pending' : 'Unavailable'}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-swapcircle-blue text-sm font-medium link-swapcircle px-3 py-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0`}
          >
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {loading && (
              <div className="text-center py-12">
                <p className="text-swapcircle-secondary">Loading items...</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-swapcircle-secondary text-sm">
                    Showing {filteredListings.length} of {listings.length} items
                  </p>
                </div>
                {filteredListings.length > 0 ? (
                  <ListingsGrid
                    title=""
                    listings={filteredListings}
                  />
                ) : (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 mx-auto mb-4 icon-tertiary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="heading-primary text-xl font-semibold mb-2">
                  No items found
                </h3>
                <p className="text-swapcircle-secondary text-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

