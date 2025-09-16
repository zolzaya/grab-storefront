import { useState } from 'react'

export interface Brand {
  id: string
  name: string
  logo?: string
  productCount?: number
}

interface BrandFilterProps {
  brands: Brand[]
  selectedBrands: string[]
  onBrandToggle: (brandId: string) => void
  className?: string
  showProductCount?: boolean
}

export default function BrandFilter({
  brands,
  selectedBrands,
  onBrandToggle,
  className = '',
  showProductCount = false
}: BrandFilterProps) {
  const [showAll, setShowAll] = useState(false)

  // Show first 12 brands by default, or all if showAll is true
  const visibleBrands = showAll ? brands : brands.slice(0, 12)
  const hasMoreBrands = brands.length > 12

  const getBrandImageSrc = (brand: Brand) => {
    // For demo purposes, we'll use placeholder brand colors/text
    // In real app, you'd use brand.logo if available
    const brandColors: Record<string, string> = {
      'samsung': '#1f2937', // Dark gray
      'asus': '#3b82f6', // Blue
      'grohe': '#ef4444', // Red
      'ecco': '#10b981', // Green
      'redmi': '#f59e0b', // Orange
      'sony': '#8b5cf6', // Purple
      'sk': '#ec4899', // Pink
      'visa': '#1e40af', // Blue
      'grosse': '#059669', // Emerald
      'arius': '#dc2626', // Red
      'godrej': '#7c3aed', // Violet
      'lifan': '#0891b2', // Cyan
      'haier': '#ea580c', // Orange
      'bosch': '#0d9488', // Teal
      'lg': '#be185d', // Pink
      'star': '#4f46e5', // Indigo
      'trane': '#0369a1', // Sky
      'chill': '#7c2d12', // Brown
      'under': '#166534', // Green
      'point': '#92400e', // Yellow
      'red': '#991b1b', // Red
      'sony2': '#4338ca' // Indigo
    }

    return brandColors[brand.id] || '#6b7280' // Default gray
  }

  return (
    <div className={`space-y-4 ${className}`} role="group" aria-labelledby="brand-filter-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="brand-filter-heading" className="text-sm font-medium text-gray-900">
          Брэнд
        </h3>
        {hasMoreBrands && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-red-600 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
            aria-expanded={showAll}
            aria-controls="brand-grid"
            aria-label={showAll ? 'Hide additional brands' : 'Show all brands'}
          >
            {showAll ? 'Хураах' : 'Бүгдийг харах'}
          </button>
        )}
      </div>

      {/* Brand Grid */}
      <div
        id="brand-grid"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        role="group"
        aria-label="Brand filter options"
      >
        {visibleBrands.map((brand) => {
          const isSelected = selectedBrands.includes(brand.id)
          const brandColor = getBrandImageSrc(brand)

          return (
            <button
              key={brand.id}
              onClick={() => onBrandToggle(brand.id)}
              className={`group relative p-3 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                isSelected
                  ? 'border-red-500 bg-red-50 shadow-sm ring-1 ring-red-500'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
              aria-pressed={isSelected}
              aria-label={`${brand.name}${showProductCount && brand.productCount ? ` (${brand.productCount} products)` : ''} ${isSelected ? 'selected' : 'not selected'}`}
              type="button"
            >
              {/* Brand Logo/Color Block */}
              <div className="aspect-square w-full rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Brand Name */}
              <div className="mt-2 text-center">
                <span className={`text-xs font-medium leading-tight ${
                  isSelected ? 'text-red-700' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {brand.name}
                </span>
                {showProductCount && brand.productCount && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    ({brand.productCount})
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Brands Summary */}
      {selectedBrands.length > 0 && (
        <div className="flex items-center justify-between text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          <span className="text-red-700 font-medium">
            {selectedBrands.length} брэнд сонгосон
          </span>
          <button
            onClick={() => selectedBrands.forEach(id => onBrandToggle(id))}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            Бүгдийг цэвэрлэх
          </button>
        </div>
      )}
    </div>
  )
}