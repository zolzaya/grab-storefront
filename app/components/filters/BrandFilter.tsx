import { useState, useMemo } from 'react'

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
  title?: string
}

export default function BrandFilter({
  brands,
  selectedBrands,
  onBrandToggle,
  className = '',
  showProductCount = true,
  title = 'Brand'
}: BrandFilterProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)

  // Filter brands based on search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands
    return brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [brands, searchTerm])

  // Show first 10 brands by default, or all if showAll is true
  const visibleBrands = showAll ? filteredBrands : filteredBrands.slice(0, 10)
  const hasMoreBrands = filteredBrands.length > 10

  // Hide component if no brands available
  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <div className={className} role="group" aria-labelledby="brand-filter-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 id="brand-filter-heading" className="text-sm font-medium text-gray-900">
          {title}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse brand filter' : 'Expand brand filter'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            )}
          </svg>
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Search Input - only show if there are many brands */}
          {brands.length > 8 && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="Брэнд хайх..."
              />
            </div>
          )}

          {/* Brand List - no scrolling, use expand/shrink instead */}
          <div className="space-y-2">
            {visibleBrands.map((brand) => {
              const isSelected = selectedBrands.includes(brand.id)

              return (
                <label
                  key={brand.id}
                  className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded cursor-pointer group"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onBrandToggle(brand.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 truncate">
                      {brand.name}
                    </span>
                  </div>

                  {showProductCount && brand.productCount && (
                    <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                      {brand.productCount}
                    </span>
                  )}
                </label>
              )
            })}
          </div>

          {/* Show More/Less Button */}
          {hasMoreBrands && (
            <div className="pt-3">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center justify-center w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {showAll ? 'Цөөнийг харуулах' : 'Олныг харуулах'}
              </button>
            </div>
          )}

          {/* No Results */}
          {searchTerm && filteredBrands.length === 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              "{searchTerm}" гэсэн утгаар илэрц олдсонгүй
            </div>
          )}
        </div>
      )}
    </div>
  )
}