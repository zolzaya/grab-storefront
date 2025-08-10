import { useState, useCallback } from "react"
import type { FacetValue, FacetValueResult } from "~/lib/types"

interface BrandFilterProps {
  brandValues: FacetValueResult[]
  selectedBrands: string[]
  onChange: (brands: string[]) => void
  className?: string
}

// Brand logos mapping - in a real app, this would be stored in a database or CDN
const BRAND_LOGOS: { [key: string]: string } = {
  'nike': 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
  'adidas': 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
  'apple': 'https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png',
  'samsung': 'https://logos-world.net/wp-content/uploads/2020/07/Samsung-Logo.png',
  'sony': 'https://logos-world.net/wp-content/uploads/2020/07/Sony-Logo.png',
  'microsoft': 'https://logos-world.net/wp-content/uploads/2020/04/Microsoft-Logo.png',
  'google': 'https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png',
  'amazon': 'https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png',
  'facebook': 'https://logos-world.net/wp-content/uploads/2020/04/Facebook-Logo.png',
  'twitter': 'https://logos-world.net/wp-content/uploads/2020/06/Twitter-Logo.png',
  'instagram': 'https://logos-world.net/wp-content/uploads/2020/04/Instagram-Logo.png',
  'youtube': 'https://logos-world.net/wp-content/uploads/2020/06/YouTube-Logo.png'
}

function getBrandLogo(brandName: string): string | null {
  const cleanName = brandName.toLowerCase().trim()
  return BRAND_LOGOS[cleanName] || null
}

function BrandItem({ 
  brand, 
  isSelected, 
  onToggle,
  viewMode = 'list'
}: { 
  brand: { id: string; name: string; count: number }
  isSelected: boolean
  onToggle: () => void
  viewMode?: 'list' | 'grid' | 'compact'
}) {
  const logoUrl = getBrandLogo(brand.name)
  
  if (viewMode === 'grid') {
    return (
      <button
        onClick={onToggle}
        className={`relative p-4 border-2 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 group ${
          isSelected 
            ? 'border-brand-600 bg-brand-50' 
            : 'border-neutral-300 hover:border-neutral-400 hover:shadow-md'
        }`}
      >
        <div className="flex flex-col items-center space-y-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brand.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          
          {/* Fallback initial */}
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm ${logoUrl ? 'hidden' : ''}`}>
            {brand.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="text-center">
            <p className={`font-medium text-sm truncate max-w-full ${isSelected ? 'text-brand-700' : 'text-neutral-900'}`}>
              {brand.name}
            </p>
            <p className="text-xs text-neutral-500">
              {brand.count} items
            </p>
          </div>
        </div>
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    )
  }

  if (viewMode === 'compact') {
    return (
      <button
        onClick={onToggle}
        className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border transition-colors duration-200 ${
          isSelected
            ? 'border-brand-600 bg-brand-50 text-brand-700'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
        }`}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt={brand.name}
            className="w-4 h-4 object-contain"
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        )}
        <span className="text-sm font-medium">{brand.name}</span>
        <span className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full">
          {brand.count}
        </span>
      </button>
    )
  }

  // List view (default)
  return (
    <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-50 cursor-pointer group transition-colors duration-200">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500 focus:ring-2"
      />
      
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={brand.name}
            className="w-8 h-8 object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        
        {/* Fallback initial */}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${logoUrl ? 'hidden' : ''}`}>
          {brand.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 group-hover:text-brand-700 truncate">
            {brand.name}
          </p>
        </div>
        
        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full flex-shrink-0">
          {brand.count}
        </span>
      </div>
    </label>
  )
}

export function BrandFilter({
  brandValues,
  selectedBrands,
  onChange,
  className = ""
}: BrandFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list')
  const [showPopularOnly, setShowPopularOnly] = useState(false)

  // Convert facet values to brand objects and sort by count (most popular first)
  const brands = brandValues
    .map(fv => ({
      id: fv.facetValue.id,
      name: fv.facetValue.name,
      count: fv.count
    }))
    .sort((a, b) => b.count - a.count)

  // Filter brands based on search and popularity
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    const isPopular = brand.count >= Math.max(10, Math.ceil(brands.reduce((sum, b) => sum + b.count, 0) / brands.length))
    
    return matchesSearch && (!showPopularOnly || isPopular)
  })

  // Get popular brands (top 25% by product count)
  const popularBrands = brands.slice(0, Math.max(5, Math.ceil(brands.length * 0.25)))

  const handleToggleBrand = useCallback((brandId: string) => {
    const newBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId]
    onChange(newBrands)
  }, [selectedBrands, onChange])

  const handleClearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  const handleSelectPopular = useCallback(() => {
    const popularIds = popularBrands.slice(0, 5).map(b => b.id)
    onChange([...new Set([...selectedBrands, ...popularIds])])
  }, [popularBrands, selectedBrands, onChange])

  if (brands.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-neutral-700">
              Brands ({filteredBrands.length})
            </span>
            {selectedBrands.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear ({selectedBrands.length})
              </button>
            )}
          </div>
          
          {/* View mode toggle */}
          <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="List view"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded transition-colors duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-neutral-900 shadow-sm' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Grid view"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPopularOnly(!showPopularOnly)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors duration-200 ${
              showPopularOnly
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
            }`}
          >
            Popular Only
          </button>
          
          <button
            onClick={handleSelectPopular}
            className="text-xs px-3 py-1 rounded-full border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-colors duration-200"
          >
            Select Top 5
          </button>
        </div>
      </div>

      {/* Search */}
      {brands.length > 8 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Brand Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
          {filteredBrands.map((brand) => (
            <BrandItem
              key={brand.id}
              brand={brand}
              isSelected={selectedBrands.includes(brand.id)}
              onToggle={() => handleToggleBrand(brand.id)}
              viewMode="grid"
            />
          ))}
        </div>
      ) : viewMode === 'compact' ? (
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {filteredBrands.map((brand) => (
            <BrandItem
              key={brand.id}
              brand={brand}
              isSelected={selectedBrands.includes(brand.id)}
              onToggle={() => handleToggleBrand(brand.id)}
              viewMode="compact"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filteredBrands.map((brand) => (
            <BrandItem
              key={brand.id}
              brand={brand}
              isSelected={selectedBrands.includes(brand.id)}
              onToggle={() => handleToggleBrand(brand.id)}
              viewMode="list"
            />
          ))}
        </div>
      )}

      {/* Selected brands summary */}
      {selectedBrands.length > 0 && (
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Selected Brands ({selectedBrands.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map(brandId => {
              const brand = brands.find(b => b.id === brandId)
              if (!brand) return null
              
              return (
                <span
                  key={brandId}
                  className="inline-flex items-center px-3 py-1 bg-neutral-100 rounded-full text-sm"
                >
                  <span className="text-neutral-700 mr-2">{brand.name}</span>
                  <button
                    onClick={() => handleToggleBrand(brandId)}
                    className="text-neutral-500 hover:text-neutral-700"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {filteredBrands.length === 0 && (searchQuery || showPopularOnly) && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">
            {searchQuery 
              ? `No brands found matching "${searchQuery}"` 
              : "No popular brands found"
            }
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear search
              </button>
            )}
            {showPopularOnly && (
              <button
                onClick={() => setShowPopularOnly(false)}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Show all brands
              </button>
            )}
          </div>
        </div>
      )}

      {/* Popular brands showcase */}
      {!searchQuery && !showPopularOnly && popularBrands.length > 3 && (
        <div className="pt-4 border-t border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">Popular Brands</h4>
          <div className="flex flex-wrap gap-2">
            {popularBrands.slice(0, 6).map(brand => {
              const logoUrl = getBrandLogo(brand.name)
              return (
                <button
                  key={brand.id}
                  onClick={() => handleToggleBrand(brand.id)}
                  className={`inline-flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors duration-200 ${
                    selectedBrands.includes(brand.id)
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                  }`}
                >
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      className="w-4 h-4 object-contain"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  )}
                  <span className="text-sm">{brand.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}