import { useCallback } from "react"
import { RATING_FILTERS } from "~/lib/constants"

interface RatingFilterProps {
  selectedRating?: number
  onChange: (rating?: number) => void
  showDistribution?: boolean
  ratingDistribution?: { [key: number]: number }
  className?: string
}

function StarRating({ 
  rating, 
  size = 'sm',
  showNumber = true 
}: { 
  rating: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showNumber?: boolean 
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-neutral-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-neutral-600 ml-1">
          {rating}.0
        </span>
      )}
    </div>
  )
}

function RatingDistributionBar({ 
  rating, 
  count, 
  maxCount,
  isSelected,
  onClick 
}: {
  rating: number
  count: number
  maxCount: number
  isSelected: boolean
  onClick: () => void
}) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
        isSelected 
          ? 'border-brand-500 bg-brand-50' 
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <StarRating rating={rating} showNumber={false} />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-600">
            {count.toLocaleString()}
          </span>
          {isSelected && (
            <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isSelected ? 'bg-brand-500' : 'bg-neutral-400 group-hover:bg-neutral-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </button>
  )
}

export function RatingFilter({
  selectedRating,
  onChange,
  showDistribution = true,
  ratingDistribution = {},
  className = ""
}: RatingFilterProps) {
  const handleRatingSelect = useCallback((rating: number) => {
    if (selectedRating === rating) {
      onChange(undefined) // Deselect if already selected
    } else {
      onChange(rating)
    }
  }, [selectedRating, onChange])

  const handleClear = useCallback(() => {
    onChange(undefined)
  }, [onChange])

  // Calculate max count for distribution bar scaling
  const maxCount = Math.max(...Object.values(ratingDistribution), 1)
  const hasDistributionData = Object.keys(ratingDistribution).length > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">
          Customer Rating
        </span>
        {selectedRating && (
          <button
            onClick={handleClear}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Rating Distribution (if available) */}
      {showDistribution && hasDistributionData && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <RatingDistributionBar
              key={rating}
              rating={rating}
              count={ratingDistribution[rating] || 0}
              maxCount={maxCount}
              isSelected={selectedRating === rating}
              onClick={() => handleRatingSelect(rating)}
            />
          ))}
        </div>
      )}

      {/* Simple Rating Filter (if no distribution data) */}
      {(!showDistribution || !hasDistributionData) && (
        <div className="space-y-2">
          {RATING_FILTERS.map((rating) => (
            <label 
              key={rating.value} 
              className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
            >
              <input
                type="radio"
                name="rating"
                checked={selectedRating === rating.value}
                onChange={() => handleRatingSelect(rating.value)}
                className="w-4 h-4 text-brand-600 border-neutral-300 focus:ring-brand-500 focus:ring-2"
              />
              <div className="flex items-center space-x-2 flex-1">
                <StarRating rating={rating.value} showNumber={false} />
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                  {rating.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Selected Rating Display */}
      {selectedRating && (
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-sm text-neutral-600 mb-2">
            Showing products with:
          </p>
          <div className="inline-flex items-center px-3 py-2 bg-brand-50 border border-brand-200 rounded-lg">
            <StarRating rating={selectedRating} size="sm" showNumber={false} />
            <span className="text-sm font-medium text-brand-800 ml-2">
              {selectedRating}+ stars
            </span>
            <button
              onClick={handleClear}
              className="ml-3 text-brand-600 hover:text-brand-800"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Rating Info */}
      <div className="pt-3 border-t border-neutral-200">
        <div className="flex items-start space-x-2 text-xs text-neutral-500">
          <svg className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <p>Ratings are based on verified customer reviews</p>
            <p>Selecting "4+ stars" shows products with 4.0 stars or higher</p>
          </div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="pt-3 border-t border-neutral-200">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Quick Filter
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRatingSelect(5)}
            className={`px-3 py-1 text-xs border rounded-full transition-colors duration-200 ${
              selectedRating === 5
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            5 Star Only
          </button>
          <button
            onClick={() => handleRatingSelect(4)}
            className={`px-3 py-1 text-xs border rounded-full transition-colors duration-200 ${
              selectedRating === 4
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            Highly Rated
          </button>
          <button
            onClick={() => handleRatingSelect(3)}
            className={`px-3 py-1 text-xs border rounded-full transition-colors duration-200 ${
              selectedRating === 3
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            Good & Above
          </button>
        </div>
      </div>
    </div>
  )
}

// Compact version for mobile or small spaces
export function CompactRatingFilter({
  selectedRating,
  onChange,
  className = ""
}: Pick<RatingFilterProps, 'selectedRating' | 'onChange' | 'className'>) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-neutral-700 whitespace-nowrap">Min Rating:</span>
      <div className="flex space-x-1">
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(selectedRating === rating ? undefined : rating)}
            className={`flex items-center px-2 py-1 rounded-lg border text-xs transition-colors duration-200 ${
              selectedRating === rating
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            <StarRating rating={rating} size="xs" showNumber={false} />
            <span className="ml-1">{rating}+</span>
          </button>
        ))}
      </div>
    </div>
  )
}