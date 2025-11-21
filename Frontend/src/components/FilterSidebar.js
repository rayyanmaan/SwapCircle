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

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];

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
    
    if (filterType === 'categories' || filterType === 'sizes' || filterType === 'conditions') {
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

  const handleSizeChange = (size, checked) => {
    updateFilter('sizes', size, checked);
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
      sizes: [],
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

        {/* Sizes */}
        <div>
          <h3 className="heading-primary font-semibold mb-3">
            Size
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((size) => (
              <label
                key={size}
                className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  localFilters.sizes.includes(size) 
                    ? 'border-swapcircle-primary bg-swapcircle-credit' 
                    : 'border-swapcircle'
                }`}
              >
                <input
                  type="checkbox"
                  checked={localFilters.sizes.includes(size)}
                  onChange={(e) => handleSizeChange(size, e.target.checked)}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  localFilters.sizes.includes(size) 
                    ? 'text-swapcircle-blue' 
                    : 'text-swapcircle-secondary'
                }`}>
                  {size}
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

        {/* Credits Range */}
        <div>
          <h3 className="heading-primary font-semibold mb-3">
            Credits Range
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-swapcircle-secondary">
                Min Credits
              </label>
              <input
                type="number"
                min="0"
                value={localFilters.minCredits ?? ''}
                onChange={(e) => handleCreditsChange('minCredits', e.target.value)}
                placeholder="0"
                className="input-swapcircle"
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-swapcircle-secondary">
                Max Credits
              </label>
              <input
                type="number"
                min="0"
                value={localFilters.maxCredits ?? ''}
                onChange={(e) => handleCreditsChange('maxCredits', e.target.value)}
                placeholder="No limit"
                className="input-swapcircle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

