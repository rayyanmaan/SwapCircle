'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ListingsGrid from '@/components/ListingsGrid';
import FilterSidebar from '@/components/FilterSidebar';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';

// Extended sample data for browsing
const sampleListings = [
  {
    id: 1,
    title: 'Vintage Denim Jacket',
    size: 'Size M',
    credits: 2,
    condition: 'Gently Used',
    timestamp: '2h ago',
    category: 'Jackets',
    brand: 'Levi\'s',
  },
  {
    id: 2,
    title: 'Cozy Knit Sweater',
    size: 'Size S',
    credits: 1,
    condition: 'Like New',
    timestamp: '4h ago',
    category: 'Sweaters',
    brand: 'H&M',
  },
  {
    id: 3,
    title: 'Floral Summer Dress',
    size: 'Size M',
    credits: 2,
    condition: 'Like New',
    timestamp: '6h ago',
    category: 'Dresses',
    brand: 'Zara',
  },
  {
    id: 4,
    title: 'Classic White Sneakers',
    size: 'Size 8',
    credits: 1,
    condition: 'Good',
    timestamp: '1d ago',
    category: 'Shoes',
    brand: 'Converse',
  },
  {
    id: 5,
    title: 'Navy Blue Blazer',
    size: 'Size L',
    credits: 3,
    condition: 'Excellent',
    timestamp: '1d ago',
    category: 'Jackets',
    brand: 'H&M',
  },
  {
    id: 6,
    title: 'Red Leather Backpack',
    size: 'One Size',
    credits: 5,
    condition: 'Like New',
    timestamp: '2d ago',
    category: 'Accessories',
    brand: 'Fossil',
  },
  {
    id: 7,
    title: 'Striped Button Down Shirt',
    size: 'Size M',
    credits: 1,
    condition: 'Gently Used',
    timestamp: '2d ago',
    category: 'Tops',
    brand: 'Uniqlo',
  },
  {
    id: 8,
    title: 'Athletic Leggings',
    size: 'Size S',
    credits: 2,
    condition: 'Excellent',
    timestamp: '3d ago',
    category: 'Bottoms',
    brand: 'Nike',
  },
  {
    id: 9,
    title: 'Black Leather Boots',
    size: 'Size 9',
    credits: 4,
    condition: 'Like New',
    timestamp: '3d ago',
    category: 'Shoes',
    brand: 'Dr. Martens',
  },
  {
    id: 10,
    title: 'Oversized Hoodie',
    size: 'Size L',
    credits: 2,
    condition: 'Gently Used',
    timestamp: '4d ago',
    category: 'Sweaters',
    brand: 'Champion',
  },
  {
    id: 11,
    title: 'Silk Scarf',
    size: 'One Size',
    credits: 1,
    condition: 'Excellent',
    timestamp: '5d ago',
    category: 'Accessories',
    brand: 'Unknown',
  },
  {
    id: 12,
    title: 'High-Waisted Jeans',
    size: 'Size 28',
    credits: 3,
    condition: 'Like New',
    timestamp: '5d ago',
    category: 'Bottoms',
    brand: 'Levi\'s',
  },
];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    categories: [],
    sizes: [],
    conditions: [],
    minCredits: null,
    maxCredits: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = [...sampleListings];

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

    // Size filter
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((item) =>
        filters.sizes.some((size) => item.size.includes(size))
      );
    }

    // Condition filter
    if (filters.conditions.length > 0) {
      filtered = filtered.filter((item) =>
        filters.conditions.includes(item.condition)
      );
    }

    // Credits range filter
    if (filters.minCredits !== null) {
      filtered = filtered.filter((item) => item.credits >= filters.minCredits);
    }
    if (filters.maxCredits !== null) {
      filtered = filtered.filter((item) => item.credits <= filters.maxCredits);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // Already sorted by timestamp (newest first in sample data)
        break;
      case 'oldest':
        filtered.reverse();
        break;
      case 'credits-low':
        filtered.sort((a, b) => a.credits - b.credits);
        break;
      case 'credits-high':
        filtered.sort((a, b) => b.credits - a.credits);
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
  }, [searchQuery, filters, sortBy]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      sizes: [],
      conditions: [],
      minCredits: null,
      maxCredits: null,
    });
    setSearchQuery('');
  };

  const activeFilterCount =
    filters.categories.length +
    filters.sizes.length +
    filters.conditions.length +
    (filters.minCredits !== null ? 1 : 0) +
    (filters.maxCredits !== null ? 1 : 0);

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fdf2f8' }}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1e1b4b' }}>
            Browse All Items
          </h1>
          <p className="text-lg" style={{ color: '#7c3aed' }}>
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
              className="lg:hidden px-4 py-2 border-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                borderColor: '#9333ea',
                color: '#9333ea',
                backgroundColor: 'transparent',
              }}
            >
              <svg
                className="w-5 h-5"
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
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#9333ea' }}
                >
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
              <span className="text-sm font-medium" style={{ color: '#7c3aed' }}>
                Active filters:
              </span>
              {filters.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-full text-sm bg-white border"
                  style={{ borderColor: '#fbcfe8', color: '#7c3aed' }}
                >
                  {cat}
                </span>
              ))}
              {filters.sizes.map((size) => (
                <span
                  key={size}
                  className="px-3 py-1 rounded-full text-sm bg-white border"
                  style={{ borderColor: '#fbcfe8', color: '#7c3aed' }}
                >
                  {size}
                </span>
              ))}
              {filters.conditions.map((cond) => (
                <span
                  key={cond}
                  className="px-3 py-1 rounded-full text-sm bg-white border"
                  style={{ borderColor: '#fbcfe8', color: '#7c3aed' }}
                >
                  {cond}
                </span>
              ))}
              {(filters.minCredits !== null || filters.maxCredits !== null) && (
                <span
                  className="px-3 py-1 rounded-full text-sm bg-white border"
                  style={{ borderColor: '#fbcfe8', color: '#7c3aed' }}
                >
                  Credits: {filters.minCredits !== null ? filters.minCredits : '0'} -{' '}
                  {filters.maxCredits !== null ? filters.maxCredits : '∞'}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: '#9333ea' }}
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
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm" style={{ color: '#7c3aed' }}>
                Showing {filteredListings.length} of {sampleListings.length} items
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
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: '#a78bfa' }}
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#1e1b4b' }}>
                  No items found
                </h3>
                <p className="text-sm mb-4" style={{ color: '#7c3aed' }}>
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 text-white"
                  style={{ backgroundColor: '#9333ea' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

