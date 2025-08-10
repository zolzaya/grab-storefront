import { useState, useCallback } from "react"
import type { FacetValue, FacetValueResult } from "~/lib/types"

interface SizeFilterProps {
  sizeValues: FacetValueResult[]
  selectedSizes: string[]
  onChange: (sizes: string[]) => void
  className?: string
}

// Size ordering for different categories
const SIZE_ORDERS: { [key: string]: string[] } = {
  clothing: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL'],
  shoes: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '15'],
  kids: ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', '14', '16'],
  waist: ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '42', '44', '46', '48', '50'],
  numeric: Array.from({ length: 50 }, (_, i) => (i + 1).toString()),
  alpha: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
}

function detectSizeType(sizes: string[]): keyof typeof SIZE_ORDERS {
  const sizeSet = new Set(sizes.map(s => s.toUpperCase()))
  
  // Check for clothing sizes
  if (SIZE_ORDERS.clothing.some(size => sizeSet.has(size))) {
    return 'clothing'
  }
  
  // Check for shoe sizes
  if (sizes.some(size => /^\d+(\.\d+)?$/.test(size))) {
    return 'shoes'
  }
  
  // Check for kids sizes
  if (sizes.some(size => /(M|T)$/.test(size.toUpperCase()))) {
    return 'kids'
  }
  
  // Check for waist sizes
  if (sizes.every(size => /^\d+$/.test(size)) && sizes.some(size => parseInt(size) >= 24 && parseInt(size) <= 50)) {
    return 'waist'
  }
  
  // Check for numeric
  if (sizes.every(size => /^\d+$/.test(size))) {
    return 'numeric'
  }
  
  // Default to alpha
  return 'alpha'
}

function sortSizes(sizes: { id: string; name: string; count: number }[]): typeof sizes {
  const sizeNames = sizes.map(s => s.name)
  const sizeType = detectSizeType(sizeNames)
  const orderArray = SIZE_ORDERS[sizeType]
  
  return sizes.sort((a, b) => {
    const aIndex = orderArray.indexOf(a.name.toUpperCase())
    const bIndex = orderArray.indexOf(b.name.toUpperCase())
    
    // If both sizes are in the order array, sort by index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    
    // If neither is in the order array, sort alphabetically
    return a.name.localeCompare(b.name)
  })
}

function SizeChart({ sizeType }: { sizeType: keyof typeof SIZE_ORDERS }) {
  const charts = {
    clothing: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Clothing Size Guide</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-neutral-200 rounded-lg">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-2 py-2 text-left">Size</th>
                <th className="px-2 py-2 text-left">Chest (in)</th>
                <th className="px-2 py-2 text-left">Waist (in)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">S</td>
                <td className="px-2 py-2">34-36</td>
                <td className="px-2 py-2">28-30</td>
              </tr>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">M</td>
                <td className="px-2 py-2">38-40</td>
                <td className="px-2 py-2">32-34</td>
              </tr>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">L</td>
                <td className="px-2 py-2">42-44</td>
                <td className="px-2 py-2">36-38</td>
              </tr>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">XL</td>
                <td className="px-2 py-2">46-48</td>
                <td className="px-2 py-2">40-42</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    
    shoes: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Shoe Size Guide</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-neutral-200 rounded-lg">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-2 py-2 text-left">US</th>
                <th className="px-2 py-2 text-left">EU</th>
                <th className="px-2 py-2 text-left">UK</th>
                <th className="px-2 py-2 text-left">CM</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">8</td>
                <td className="px-2 py-2">41</td>
                <td className="px-2 py-2">7</td>
                <td className="px-2 py-2">26</td>
              </tr>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">9</td>
                <td className="px-2 py-2">42</td>
                <td className="px-2 py-2">8</td>
                <td className="px-2 py-2">27</td>
              </tr>
              <tr className="border-t border-neutral-200">
                <td className="px-2 py-2 font-medium">10</td>
                <td className="px-2 py-2">43</td>
                <td className="px-2 py-2">9</td>
                <td className="px-2 py-2">28</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    
    kids: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Kids Size Guide</h4>
        <div className="text-xs text-neutral-600 space-y-1">
          <p><strong>Baby:</strong> 0-3M, 3-6M, 6-9M, 9-12M, 12-18M, 18-24M</p>
          <p><strong>Toddler:</strong> 2T, 3T, 4T, 5T</p>
          <p><strong>Kids:</strong> 6, 7, 8, 10, 12, 14, 16</p>
        </div>
      </div>
    ),
    
    waist: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Waist Size Guide</h4>
        <p className="text-xs text-neutral-600">
          Sizes are in inches. Measure around your natural waistline.
        </p>
      </div>
    ),
    
    numeric: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">Size Guide</h4>
        <p className="text-xs text-neutral-600">
          Numeric sizes vary by product. Check individual product descriptions.
        </p>
      </div>
    ),
    
    alpha: (
      <div className="space-y-3">
        <h4 className="font-semibold text-neutral-900">General Size Guide</h4>
        <p className="text-xs text-neutral-600">
          Standard sizing from XXS to XXXL. Check product descriptions for specific measurements.
        </p>
      </div>
    )
  }
  
  return charts[sizeType] || charts.alpha
}

export function SizeFilter({
  sizeValues,
  selectedSizes,
  onChange,
  className = ""
}: SizeFilterProps) {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Convert facet values to size objects and sort them
  const sizes = sortSizes(
    sizeValues.map(fv => ({
      id: fv.facetValue.id,
      name: fv.facetValue.name,
      count: fv.count
    }))
  )

  // Filter sizes based on search
  const filteredSizes = sizes.filter(size => 
    size.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Detect size type for appropriate sizing
  const sizeType = detectSizeType(sizes.map(s => s.name))

  const handleToggleSize = useCallback((sizeId: string) => {
    const newSizes = selectedSizes.includes(sizeId)
      ? selectedSizes.filter(id => id !== sizeId)
      : [...selectedSizes, sizeId]
    onChange(newSizes)
  }, [selectedSizes, onChange])

  const handleClearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  const handleSelectRange = useCallback((startIndex: number, endIndex: number) => {
    const rangeSizes = filteredSizes.slice(startIndex, endIndex + 1).map(s => s.id)
    const newSizes = [...new Set([...selectedSizes, ...rangeSizes])]
    onChange(newSizes)
  }, [filteredSizes, selectedSizes, onChange])

  if (sizes.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-700">
            Sizes ({filteredSizes.length})
          </span>
          {selectedSizes.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear ({selectedSizes.length})
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowSizeChart(!showSizeChart)}
          className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center space-x-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Size Guide</span>
        </button>
      </div>

      {/* Size Chart */}
      {showSizeChart && (
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 animate-fade-in">
          <SizeChart sizeType={sizeType} />
        </div>
      )}

      {/* Search */}
      {sizes.length > 8 && (
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sizes..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200"
          />
          <svg className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Quick Range Selection */}
      {(sizeType === 'clothing' || sizeType === 'alpha') && filteredSizes.length > 5 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Quick Select
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectRange(0, 2)} // XS, S, M
              className="px-3 py-1 text-xs border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors duration-200"
            >
              Small Sizes
            </button>
            <button
              onClick={() => handleSelectRange(1, 4)} // S, M, L, XL
              className="px-3 py-1 text-xs border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors duration-200"
            >
              Standard Sizes
            </button>
            <button
              onClick={() => handleSelectRange(3, filteredSizes.length - 1)} // L, XL, XXL+
              className="px-3 py-1 text-xs border border-neutral-300 rounded-full hover:bg-neutral-50 transition-colors duration-200"
            >
              Large Sizes
            </button>
          </div>
        </div>
      )}

      {/* Size Grid */}
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {filteredSizes.map((size) => (
          <button
            key={size.id}
            onClick={() => handleToggleSize(size.id)}
            className={`relative p-3 text-sm font-medium border-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
              selectedSizes.includes(size.id)
                ? 'border-brand-600 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <div className="text-center">
              <span className="block font-semibold">{size.name}</span>
              <span className="text-xs text-neutral-500">({size.count})</span>
            </div>
            
            {selectedSizes.includes(size.id) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Selected Sizes Summary */}
      {selectedSizes.length > 0 && (
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-700 mb-2">
            Selected Sizes ({selectedSizes.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedSizes.map(sizeId => {
              const size = sizes.find(s => s.id === sizeId)
              if (!size) return null
              
              return (
                <span
                  key={sizeId}
                  className="inline-flex items-center px-2 py-1 bg-brand-100 text-brand-800 text-xs font-medium rounded-full"
                >
                  {size.name}
                  <button
                    onClick={() => handleToggleSize(sizeId)}
                    className="ml-1 text-brand-600 hover:text-brand-800"
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

      {/* No Results */}
      {filteredSizes.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-500">No sizes found matching "{searchQuery}"</p>
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