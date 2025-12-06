'use client';

import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Jackets',
  'Sweaters',
  'Shoes',
  'Accessories',
];

const LOCATIONS = [
  'San Francisco',
  'Berlin',
  'Buenos Aires',
  'Hyderabad',
  'Seoul',
  'Taipei',
  'Tokyo',
  'Other',
];

const CONDITIONS = [
  'Like New',
  'Excellent',
  'Good',
  'Gently Used',
];

export default function FilterSidebar({ filters, onChange, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync local filters with props when they change externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (filterType, value, checked) => {
    const newFilters = { ...localFilters };
    
    if (filterType === 'categories' || filterType === 'conditions' || filterType === 'locations') {
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter((item) => item !== value);
      }
    } else if (filterType === 'minCredits') {
      newFilters.minCredits = checked ? value : null;
    } else if (filterType === 'maxCredits') {
      newFilters.maxCredits = checked ? value : null;
    }

    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handleCategoryChange = (category, checked) => {
    updateFilter('categories', category, checked);
  };

  const handleLocationChange = (location, checked) => {
    updateFilter('locations', location, checked);
  };

  const handleConditionChange = (condition, checked) => {
    updateFilter('conditions', condition, checked);
  };

  const handleCreditsChange = (type, value) => {
    const numValue = value === '' ? null : (isNaN(parseInt(value, 10)) ? null : parseInt(value, 10));
    const newFilters = { ...localFilters, [type]: numValue };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      locations: [],
      conditions: [],
      minCredits: null,
      maxCredits: null,
    };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  return (
    <div className="card-swapcircle bg-white rounded-lg border p-6 border-swapcircle">
      {/* Mobile Close Button */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <h2 className="heading-primary text-xl font-bold">
          Filters
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors icon-secondary"
          aria-label="Close filters"
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
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Desktop Title */}
      <h2 className="heading-primary hidden lg:block text-xl font-bold mb-6">
        Filters
      </h2>

      {/* Clear All Button */}
      <button
        onClick={clearAllFilters}
        className="text-swapcircle-blue text-sm font-medium link-swapcircle mb-6"
      >
        Clear all filters
      </button>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="heading-primary font-semibold mb-3">
            Category
          </h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="w-4 h-4 rounded border-swapcircle focus:ring-2 focus:ring-primary"
                  style={{
                    accentColor: 'var(--swapcircle-primary)',
                  }}
                />
                <span className="ml-2 text-sm transition-colors group-hover:opacity-70 text-swapcircle-secondary">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="heading-primary font-semibold mb-3">
            Location
          </h3>
          <div className="space-y-2">
            {LOCATIONS.map((location) => (
              <label
                key={location}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={localFilters.locations?.includes(location) || false}
                  onChange={(e) => handleLocationChange(location, e.target.checked)}
                  className="w-4 h-4 rounded border-swapcircle focus:ring-2 focus:ring-primary"
                  style={{
                    accentColor: 'var(--swapcircle-primary)',
                  }}
                />
                <span className="ml-2 text-sm transition-colors group-hover:opacity-70 text-swapcircle-secondary">
                  {location}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Condition */}
        <div>
          <h3 className="heading-primary font-semibold mb-3">
            Condition
          </h3>
          <div className="space-y-2">
            {CONDITIONS.map((condition) => (
              <label
                key={condition}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={localFilters.conditions.includes(condition)}
                  onChange={(e) => handleConditionChange(condition, e.target.checked)}
                  className="w-4 h-4 rounded border-swapcircle focus:ring-2 focus:ring-primary"
                  style={{
                    accentColor: 'var(--swapcircle-primary)',
                  }}
                />
                <span className="ml-2 text-sm transition-colors group-hover:opacity-70 text-swapcircle-secondary">
                  {condition}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

