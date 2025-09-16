import { useState } from 'react'

export type ViewMode = 'grid' | 'list'
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating' | 'discount'

interface PageHeaderProps {
  title: string
  totalProducts: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

const sortOptions = [
  { value: 'newest', label: 'Шинэ хямдрал' },
  { value: 'price-asc', label: 'Үнэ: Бага -> Их' },
  { value: 'price-desc', label: 'Үнэ: Их -> Бага' },
  { value: 'popular', label: 'Хамгийн алдартай' },
  { value: 'rating', label: 'Үнэлгээгээр' },
  { value: 'discount', label: 'Хямдралаар' },
] as const

export default function PageHeader({
  title,
  totalProducts,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange
}: PageHeaderProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)

  const currentSortLabel = sortOptions.find(option => option.value === sortBy)?.label || 'Эрэмбэлэх'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      {/* Title and Count */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
        </h1>
        <span className="text-gray-500 text-lg">
          | {totalProducts.toLocaleString()} бүтээгдэхүүн
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 flex items-center justify-center transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="Grid view"
            title="Grid view"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 flex items-center justify-center transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label="List view"
            title="List view"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-expanded={sortDropdownOpen}
            aria-haspopup="listbox"
          >
            {currentSortLabel}
            <svg
              className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {sortDropdownOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortDropdownOpen(false)}
                aria-hidden="true"
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="py-1" role="listbox">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value)
                        setSortDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                        sortBy === option.value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                      role="option"
                      aria-selected={sortBy === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}