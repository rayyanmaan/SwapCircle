'use client';

export default function SortDropdown({ value, onChange }) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'credits-low', label: 'Credits: Low to High' },
    { value: 'credits-high', label: 'Credits: High to Low' },
    { value: 'title-asc', label: 'Title: A to Z' },
    { value: 'title-desc', label: 'Title: Z to A' },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-all"
        style={{
          borderColor: '#fbcfe8',
          color: '#1e1b4b',
          backgroundColor: 'white',
        }}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: '#7c3aed' }}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

