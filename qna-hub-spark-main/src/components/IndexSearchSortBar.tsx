import { useState } from 'react';

type SortByType = 'newest' | 'votes' | 'company';

interface IndexSearchSortBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortByType;
  setSortBy: (v: SortByType) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
}

export function IndexSearchSortBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
}: IndexSearchSortBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Search box */}
      <div className="relative flex-1">
        {/* magnifying glass icon as inline SVG */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search questions, companies, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
        />
      </div>

      {/* Sort & Filters */}
      <div className="flex gap-2 items-center">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortByType)}
          className="w-36 px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest</option>
          <option value="votes">Most Voted</option>
          <option value="company">Company A–Z</option>
        </select>

        {/* Filters button visible only on mobile */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {/* filter icon as inline SVG */}
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M6 12h12M10 20h4"
            />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
}
