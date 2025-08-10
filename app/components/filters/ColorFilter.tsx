import { useState, useCallback } from "react"
import type { FacetValue, FacetValueResult } from "~/lib/types"

interface ColorFilterProps {
  colorValues: FacetValueResult[]
  selectedColors: string[]
  onChange: (colors: string[]) => void
  className?: string
}

interface ColorSwatch {
  id: string
  name: string
  hex: string
  count: number
}

// Common color mappings - in a real app this might come from a database or configuration
const COLOR_MAPPINGS: { [key: string]: string } = {
  // Basic colors
  'red': '#EF4444',
  'blue': '#3B82F6',
  'green': '#10B981',
  'yellow': '#F59E0B',
  'purple': '#8B5CF6',
  'pink': '#EC4899',
  'orange': '#F97316',
  'black': '#1F2937',
  'white': '#FFFFFF',
  'gray': '#6B7280',
  'grey': '#6B7280',
  'brown': '#92400E',
  'navy': '#1E40AF',
  'teal': '#14B8A6',
  'cyan': '#06B6D4',
  'lime': '#84CC16',
  'indigo': '#6366F1',
  'violet': '#7C3AED',
  'fuchsia': '#C026D3',
  'rose': '#F43F5E',
  'emerald': '#059669',
  'sky': '#0EA5E9',
  'amber': '#D97706',
  'slate': '#475569',
  'zinc': '#52525B',
  'neutral': '#525252',
  'stone': '#57534E',
  
  // Additional variations
  'light-gray': '#D1D5DB',
  'dark-gray': '#374151',
  'light-blue': '#93C5FD',
  'dark-blue': '#1E40AF',
  'light-green': '#86EFAC',
  'dark-green': '#047857',
  'beige': '#F5F5DC',
  'cream': '#FFFDD0',
  'gold': '#FFD700',
  'silver': '#C0C0C0',
  'bronze': '#CD7F32',
  'maroon': '#800000',
  'olive': '#808000',
  'coral': '#FF7F50',
  'salmon': '#FA8072',
  'khaki': '#F0E68C',
  'tan': '#D2B48C',
  'ivory': '#FFFFF0'
}

function getColorHex(colorName: string): string {
  const cleanName = colorName.toLowerCase().trim()
  
  // Direct mapping
  if (COLOR_MAPPINGS[cleanName]) {
    return COLOR_MAPPINGS[cleanName]
  }
  
  // Try to find partial matches
  for (const [key, hex] of Object.entries(COLOR_MAPPINGS)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return hex
    }
  }
  
  // Fallback to a hash-based color generation
  let hash = 0
  for (let i = 0; i < colorName.length; i++) {
    hash = colorName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 60%, 50%)`
}

function ColorSwatch({ 
  color, 
  isSelected, 
  onClick, 
  size = 'md' 
}: { 
  color: ColorSwatch
  isSelected: boolean
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const checkSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
        isSelected 
          ? 'border-brand-600 ring-2 ring-brand-500 ring-offset-2' 
          : 'border-neutral-300 hover:border-neutral-400'
      }`}
      style={{ backgroundColor: color.hex }}
      title={`${color.name} (${color.count})`}
    >
      {isSelected && (
        <div className="flex items-center justify-center w-full h-full">
          <svg 
            className={`${checkSizeClasses[size]} ${
              color.hex === '#FFFFFF' || color.hex === '#FFFFF0' || color.hex === '#FFFDD0' 
                ? 'text-neutral-800' 
                : 'text-white'
            }`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
    </button>
  )
}

export function ColorFilter({
  colorValues,
  selectedColors,
  onChange,
  className = ""
}: ColorFilterProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  // Convert facet values to color swatches
  const colorSwatches: ColorSwatch[] = colorValues.map(fv => ({
    id: fv.facetValue.id,
    name: fv.facetValue.name,
    hex: getColorHex(fv.facetValue.name),
    count: fv.count
  }))

  // Filter colors based on search
  const filteredColors = colorSwatches.filter(color => 
    color.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleColor = useCallback((colorId: string) => {
    const newColors = selectedColors.includes(colorId)
      ? selectedColors.filter(id => id !== colorId)
      : [...selectedColors, colorId]
    onChange(newColors)
  }, [selectedColors, onChange])

  const handleClearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  if (colorSwatches.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-700">
            Colors ({filteredColors.length})
          </span>
          {selectedColors.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear ({selectedColors.length})
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-1 bg-neutral-100 rounded-lg p-1">
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
        </div>
      </div>

      {/* Search */}
      {colorSwatches.length > 8 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search colors..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Color Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-6 gap-3 max-h-48 overflow-y-auto">
          {filteredColors.map((color) => (
            <div key={color.id} className="flex flex-col items-center space-y-1">
              <ColorSwatch
                color={color}
                isSelected={selectedColors.includes(color.id)}
                onClick={() => handleToggleColor(color.id)}
              />
              <span className="text-xs text-neutral-600 text-center truncate w-full" title={color.name}>
                {color.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredColors.map((color) => (
            <label
              key={color.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(color.id)}
                onChange={() => handleToggleColor(color.id)}
                className="sr-only"
              />
              <ColorSwatch
                color={color}
                isSelected={selectedColors.includes(color.id)}
                onClick={() => handleToggleColor(color.id)}
                size="sm"
              />
              <span className="flex-1 text-sm text-neutral-700 group-hover:text-neutral-900">
                {color.name}
              </span>
              <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                {color.count}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Selected Colors Summary */}
      {selectedColors.length > 0 && (
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Selected Colors ({selectedColors.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedColors.map(colorId => {
              const color = colorSwatches.find(c => c.id === colorId)
              if (!color) return null
              
              return (
                <div
                  key={colorId}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-neutral-100 rounded-full text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full border border-neutral-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-neutral-700">{color.name}</span>
                  <button
                    onClick={() => handleToggleColor(colorId)}
                    className="text-neutral-500 hover:text-neutral-700 ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredColors.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No colors found matching "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-1"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}