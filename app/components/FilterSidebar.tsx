import { useState, useCallback } from "react"
import type { 
  FilterState, 
  Facet, 
  FacetValueResult, 
  Collection, 
  PriceRange 
} from "~/lib/types"
import { 
  AVAILABILITY_OPTIONS, 
  RATING_FILTERS,
  VIEW_MODES,
  ITEMS_PER_PAGE_OPTIONS 
} from "~/lib/constants"
import { getActiveFilterCount } from "~/lib/filters"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  facets: Facet[]
  facetValues: FacetValueResult[]
  collections: Collection[]
  priceRange?: PriceRange
  isOpen: boolean
  onClose: () => void
  className?: string
}

interface FilterSectionProps {
  title: string
  count?: number
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, count, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 px-0 text-left hover:text-brand-600 transition-colors duration-200"
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-neutral-900">{title}</h3>
          {count !== undefined && count > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-brand-100 text-brand-800 rounded-full">
              {count}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

function PriceRangeFilter({ 
  priceRange, 
  currentRange, 
  onChange 
}: {
  priceRange?: PriceRange
  currentRange?: PriceRange
  onChange: (range?: PriceRange) => void
}) {
  const [localMin, setLocalMin] = useState(currentRange?.min?.toString() || "")
  const [localMax, setLocalMax] = useState(currentRange?.max?.toString() || "")

  const handleApply = useCallback(() => {
    const min = localMin ? parseFloat(localMin) : undefined
    const max = localMax ? parseFloat(localMax) : undefined
    
    if (min !== undefined || max !== undefined) {
      onChange({ 
        min: min || 0, 
        max: max || (priceRange?.max || Number.MAX_SAFE_INTEGER) 
      })
    } else {
      onChange(undefined)
    }
  }, [localMin, localMax, onChange, priceRange])

  const handleClear = useCallback(() => {
    setLocalMin("")
    setLocalMax("")
    onChange(undefined)
  }, [onChange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price-min" className="block text-sm font-medium text-neutral-700 mb-1">
            Min
          </label>
          <input
            id="price-min"
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            placeholder={priceRange?.min?.toString() || "0"}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
          />
        </div>
        <div>
          <label htmlFor="price-max" className="block text-sm font-medium text-neutral-700 mb-1">
            Max
          </label>
          <input
            id="price-max"
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            placeholder={priceRange?.max?.toString() || "∞"}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors duration-200 text-sm font-medium"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="px-3 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors duration-200 text-sm font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

function CollectionFilter({ 
  collections, 
  selectedCollections, 
  onChange 
}: {
  collections: Collection[]
  selectedCollections: string[]
  onChange: (collections: string[]) => void
}) {
  const handleToggle = useCallback((slug: string) => {
    const newCollections = selectedCollections.includes(slug)
      ? selectedCollections.filter(c => c !== slug)
      : [...selectedCollections, slug]
    onChange(newCollections.length > 0 ? newCollections : [])
  }, [selectedCollections, onChange])

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {collections.map((collection) => (
        <label key={collection.id} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedCollections.includes(collection.slug)}
            onChange={() => handleToggle(collection.slug)}
            className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500 focus:ring-2"
          />
          <span className="text-sm text-neutral-700 group-hover:text-neutral-900 flex-1">
            {collection.name}
          </span>
        </label>
      ))}
    </div>
  )
}

function FacetFilter({ 
  facet, 
  facetValues, 
  selectedValues, 
  onChange 
}: {
  facet: Facet
  facetValues: FacetValueResult[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}) {
  const relevantValues = facetValues.filter(fv => fv.facetValue.facet.id === facet.id)
  
  const handleToggle = useCallback((valueId: string) => {
    const newValues = selectedValues.includes(valueId)
      ? selectedValues.filter(v => v !== valueId)
      : [...selectedValues, valueId]
    onChange(newValues)
  }, [selectedValues, onChange])

  if (relevantValues.length === 0) return null

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {relevantValues.map((fv) => (
        <label key={fv.facetValue.id} className="flex items-center justify-between cursor-pointer group">
          <div className="flex items-center space-x-3 flex-1">
            <input
              type="checkbox"
              checked={selectedValues.includes(fv.facetValue.id)}
              onChange={() => handleToggle(fv.facetValue.id)}
              className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500 focus:ring-2"
            />
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900 flex-1">
              {fv.facetValue.name}
            </span>
          </div>
          <span className="text-xs text-neutral-500 ml-2">
            ({fv.count})
          </span>
        </label>
      ))}
    </div>
  )
}

function RatingFilter({ 
  selectedRating, 
  onChange 
}: {
  selectedRating?: number
  onChange: (rating?: number) => void
}) {
  return (
    <div className="space-y-2">
      {RATING_FILTERS.map((rating) => (
        <label key={rating.value} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="radio"
            name="rating"
            checked={selectedRating === rating.value}
            onChange={() => onChange(rating.value)}
            className="w-4 h-4 text-brand-600 border-neutral-300 focus:ring-brand-500 focus:ring-2"
          />
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= rating.value ? 'text-yellow-400' : 'text-neutral-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
              {rating.label}
            </span>
          </div>
        </label>
      ))}
      <button
        onClick={() => onChange(undefined)}
        className="text-sm text-brand-600 hover:text-brand-700 font-medium"
      >
        Clear rating filter
      </button>
    </div>
  )
}

function AvailabilityFilter({ 
  selectedAvailability, 
  onChange 
}: {
  selectedAvailability: ('in_stock' | 'out_of_stock' | 'pre_order')[]
  onChange: (availability: ('in_stock' | 'out_of_stock' | 'pre_order')[]) => void
}) {
  const handleToggle = useCallback((value: 'in_stock' | 'out_of_stock' | 'pre_order') => {
    const newValues = selectedAvailability.includes(value)
      ? selectedAvailability.filter(v => v !== value)
      : [...selectedAvailability, value]
    onChange(newValues)
  }, [selectedAvailability, onChange])

  return (
    <div className="space-y-2">
      {AVAILABILITY_OPTIONS.map((option) => (
        <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedAvailability.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500 focus:ring-2"
          />
          <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function AppliedFilters({ 
  filters, 
  onRemoveFilter,
  onClearAll
}: {
  filters: FilterState
  onRemoveFilter: (type: keyof FilterState, value?: any) => void
  onClearAll: () => void
}) {
  const activeCount = getActiveFilterCount(filters)
  
  if (activeCount === 0) return null

  return (
    <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-neutral-900">Applied Filters ({activeCount})</h4>
        <button
          onClick={onClearAll}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Collections */}
        {filters.collections?.map((collection) => (
          <span
            key={collection}
            className="inline-flex items-center px-3 py-1 text-sm bg-white border border-neutral-300 rounded-full"
          >
            {collection}
            <button
              onClick={() => onRemoveFilter('collections', collection)}
              className="ml-2 text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        
        {/* Price Range */}
        {filters.priceRange && (
          <span className="inline-flex items-center px-3 py-1 text-sm bg-white border border-neutral-300 rounded-full">
            ${filters.priceRange.min} - ${filters.priceRange.max}
            <button
              onClick={() => onRemoveFilter('priceRange')}
              className="ml-2 text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
        
        {/* Rating */}
        {filters.rating !== undefined && (
          <span className="inline-flex items-center px-3 py-1 text-sm bg-white border border-neutral-300 rounded-full">
            {filters.rating}+ stars
            <button
              onClick={() => onRemoveFilter('rating')}
              className="ml-2 text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        )}
        
        {/* Availability */}
        {filters.availability?.map((availability) => (
          <span
            key={availability}
            className="inline-flex items-center px-3 py-1 text-sm bg-white border border-neutral-300 rounded-full"
          >
            {AVAILABILITY_OPTIONS.find(o => o.value === availability)?.label}
            <button
              onClick={() => onRemoveFilter('availability', availability)}
              className="ml-2 text-neutral-500 hover:text-neutral-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  facets,
  facetValues,
  collections,
  priceRange,
  isOpen,
  onClose,
  className = ""
}: FilterSidebarProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['collections', 'price', 'rating', 'availability'])
  )

  const toggleSection = useCallback((section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates, page: 1 })
  }, [filters, onFiltersChange])

  const handleRemoveFilter = useCallback((type: keyof FilterState, value?: any) => {
    const newFilters = { ...filters }
    
    if (type === 'collections' && value) {
      newFilters.collections = newFilters.collections?.filter(c => c !== value) || []
      if (newFilters.collections.length === 0) delete newFilters.collections
    } else if (type === 'availability' && value) {
      newFilters.availability = newFilters.availability?.filter(a => a !== value) || []
      if (newFilters.availability.length === 0) delete newFilters.availability
    } else {
      delete newFilters[type]
    }
    
    onFiltersChange({ ...newFilters, page: 1 })
  }, [filters, onFiltersChange])

  const handleClearAll = useCallback(() => {
    onFiltersChange({
      search: filters.search,
      sort: filters.sort,
      page: 1,
      limit: filters.limit
    })
  }, [filters.search, filters.sort, filters.limit, onFiltersChange])

  // Mobile overlay
  if (isOpen) {
    return (
      <>
        {/* Mobile backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
        
        {/* Mobile drawer */}
        <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-4">
              <FilterSidebarContent
                filters={filters}
                onFiltersChange={handleFilterChange}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAll}
                facets={facets}
                facetValues={facetValues}
                collections={collections}
                priceRange={priceRange}
                openSections={openSections}
                onToggleSection={toggleSection}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className={`hidden lg:block w-80 flex-shrink-0 ${className}`}>
      <div className="sticky top-6">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Filters</h2>
          <FilterSidebarContent
            filters={filters}
            onFiltersChange={handleFilterChange}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAll}
            facets={facets}
            facetValues={facetValues}
            collections={collections}
            priceRange={priceRange}
            openSections={openSections}
            onToggleSection={toggleSection}
          />
        </div>
      </div>
    </div>
  )
}

function FilterSidebarContent({
  filters,
  onFiltersChange,
  onRemoveFilter,
  onClearAll,
  facets,
  facetValues,
  collections,
  priceRange,
  openSections,
  onToggleSection
}: {
  filters: FilterState
  onFiltersChange: (updates: Partial<FilterState>) => void
  onRemoveFilter: (type: keyof FilterState, value?: any) => void
  onClearAll: () => void
  facets: Facet[]
  facetValues: FacetValueResult[]
  collections: Collection[]
  priceRange?: PriceRange
  openSections: Set<string>
  onToggleSection: (section: string) => void
}) {
  return (
    <div className="space-y-0">
      {/* Applied Filters */}
      <AppliedFilters
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAll}
      />

      {/* Collections */}
      {collections.length > 0 && (
        <FilterSection
          title="Categories"
          count={filters.collections?.length}
          isOpen={openSections.has('collections')}
          onToggle={() => onToggleSection('collections')}
        >
          <CollectionFilter
            collections={collections}
            selectedCollections={filters.collections || []}
            onChange={(collections) => onFiltersChange({ collections: collections.length > 0 ? collections : undefined })}
          />
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        count={filters.priceRange ? 1 : 0}
        isOpen={openSections.has('price')}
        onToggle={() => onToggleSection('price')}
      >
        <PriceRangeFilter
          priceRange={priceRange}
          currentRange={filters.priceRange}
          onChange={(range) => onFiltersChange({ priceRange: range })}
        />
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Rating"
        count={filters.rating !== undefined ? 1 : 0}
        isOpen={openSections.has('rating')}
        onToggle={() => onToggleSection('rating')}
      >
        <RatingFilter
          selectedRating={filters.rating}
          onChange={(rating) => onFiltersChange({ rating })}
        />
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        count={filters.availability?.length}
        isOpen={openSections.has('availability')}
        onToggle={() => onToggleSection('availability')}
      >
        <AvailabilityFilter
          selectedAvailability={filters.availability || []}
          onChange={(availability) => onFiltersChange({ availability: availability.length > 0 ? availability : undefined })}
        />
      </FilterSection>

      {/* Dynamic Facets */}
      {facets.map((facet) => {
        const facetKey = facet.code
        const selectedValues = filters.facets?.[facetKey] || []
        const relevantValues = facetValues.filter(fv => fv.facetValue.facet.id === facet.id)
        
        if (relevantValues.length === 0) return null

        return (
          <FilterSection
            key={facet.id}
            title={facet.name}
            count={selectedValues.length}
            isOpen={openSections.has(facetKey)}
            onToggle={() => onToggleSection(facetKey)}
          >
            <FacetFilter
              facet={facet}
              facetValues={facetValues}
              selectedValues={selectedValues}
              onChange={(values) => {
                const newFacets = { ...(filters.facets || {}) }
                if (values.length > 0) {
                  newFacets[facetKey] = values
                } else {
                  delete newFacets[facetKey]
                }
                onFiltersChange({ 
                  facets: Object.keys(newFacets).length > 0 ? newFacets : undefined 
                })
              }}
            />
          </FilterSection>
        )
      })}
    </div>
  )
}