import type {
  FilterState,
  ProductListOptions,
  SearchInput,
  PriceRange,
  SortOption
} from "./types"
import { SORT_OPTIONS } from "./constants"

/**
 * Converts filter state to ProductListOptions for the products query
 */
export function filtersToProductOptions(filters: FilterState): ProductListOptions {
  const options: ProductListOptions = {
    take: filters.limit || 12,
    skip: ((filters.page || 1) - 1) * (filters.limit || 12),
  }

  // Handle sorting
  if (filters.sort && filters.sort !== 'relevance') {
    const sortOption = SORT_OPTIONS.find(s => s.value === filters.sort)
    if (sortOption && sortOption.field && sortOption.direction) {
      options.sort = {
        [sortOption.field]: sortOption.direction
      } as any
    }
  }

  // Handle filters
  const filter: any = {}

  // Search term
  if (filters.search?.trim()) {
    filter.name = { contains: filters.search.trim() }
  }

  // Collections filter
  if (filters.collections?.length) {
    filter.collectionSlug = { in: filters.collections }
  }

  // Facet values filter
  if (filters.facets) {
    const facetValueIds: string[] = []
    Object.values(filters.facets).forEach(values => {
      facetValueIds.push(...values)
    })
    if (facetValueIds.length > 0) {
      filter.facetValueIds = { in: facetValueIds }
    }
  }

  // Price range filter
  if (filters.priceRange) {
    filter.priceRange = filters.priceRange
  }

  // Rating filter
  if (filters.rating !== undefined) {
    filter.reviewRating = { gte: filters.rating }
  }

  // Availability filter
  if (filters.availability?.length) {
    const stockLevels = filters.availability.map(a => {
      switch (a) {
        case 'in_stock': return 'IN_STOCK'
        case 'out_of_stock': return 'OUT_OF_STOCK'
        case 'pre_order': return 'PRE_ORDER'
        default: return 'OUT_OF_STOCK'
      }
    })
    filter.stockLevel = { in: stockLevels }
  }

  // Tags filter
  if (filters.tags?.length) {
    filter.tags = { in: filters.tags }
  }

  // Only add filter if it has properties
  if (Object.keys(filter).length > 0) {
    options.filter = filter
  }

  return options
}

/**
 * Converts filter state to SearchInput for the search query
 */
export function filtersToSearchInput(filters: FilterState): SearchInput {
  const input: SearchInput = {
    term: filters.search?.trim() || "",
    groupByProduct: true,
    skip: ((filters.page || 1) - 1) * (filters.limit || 12),
    take: filters.limit || 12,
  }

  // Handle sorting
  if (filters.sort && filters.sort !== 'relevance') {
    const sortOption = SORT_OPTIONS.find(s => s.value === filters.sort)
    if (sortOption && sortOption.field && sortOption.direction) {
      input.sort = {
        [sortOption.field]: sortOption.direction
      } as any
    }
  }

  // Collection filter
  if (filters.collections?.length === 1) {
    input.collectionSlug = filters.collections[0]
  }

  // Facet values filter
  if (filters.facets) {
    const facetValueIds: string[] = []
    Object.values(filters.facets).forEach(values => {
      facetValueIds.push(...values)
    })
    if (facetValueIds.length > 0) {
      input.facetValueIds = facetValueIds
      input.facetValueOperator = 'AND' // Can be made configurable
    }
  }

  // Price range filter
  if (filters.priceRange) {
    input.priceRange = filters.priceRange
  }

  // Stock filter
  if (filters.availability?.includes('in_stock') && !filters.availability.includes('out_of_stock')) {
    input.inStock = true
  } else if (filters.availability?.includes('out_of_stock') && !filters.availability.includes('in_stock')) {
    input.inStock = false
  }

  return input
}

/**
 * Converts URL search params to FilterState
 */
export function urlParamsToFilters(searchParams: URLSearchParams): FilterState {
  const filters: FilterState = {}

  const search = searchParams.get('search')
  if (search) filters.search = search

  const sort = searchParams.get('sort')
  if (sort) filters.sort = sort

  const page = searchParams.get('page')
  if (page) filters.page = parseInt(page, 10)

  const limit = searchParams.get('limit')
  if (limit) filters.limit = parseInt(limit, 10)

  // Collections
  const collections = searchParams.getAll('collection')
  if (collections.length > 0) filters.collections = collections

  // Price range
  const priceMin = searchParams.get('price_min')
  const priceMax = searchParams.get('price_max')
  if (priceMin || priceMax) {
    filters.priceRange = {
      min: priceMin ? parseFloat(priceMin) : 0,
      max: priceMax ? parseFloat(priceMax) : Number.MAX_SAFE_INTEGER,
    }
  }

  // Rating
  const rating = searchParams.get('rating')
  if (rating) filters.rating = parseFloat(rating)

  // Availability
  const availability = searchParams.getAll('availability')
  if (availability.length > 0) {
    filters.availability = availability as ('in_stock' | 'out_of_stock' | 'pre_order')[]
  }

  // Tags
  const tags = searchParams.getAll('tag')
  if (tags.length > 0) filters.tags = tags

  // Facets - handle dynamic facet parameters
  const facets: { [facetCode: string]: string[] } = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('facet_')) {
      const facetCode = key.replace('facet_', '')
      if (!facets[facetCode]) facets[facetCode] = []
      facets[facetCode].push(value)
    }
  }
  if (Object.keys(facets).length > 0) {
    filters.facets = facets
  }

  return filters
}

/**
 * Converts FilterState to URL search params
 */
export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  if (filters.sort && filters.sort !== 'relevance') {
    params.set('sort', filters.sort)
  }

  if (filters.page && filters.page > 1) {
    params.set('page', filters.page.toString())
  }

  if (filters.limit && filters.limit !== 12) {
    params.set('limit', filters.limit.toString())
  }

  // Collections
  if (filters.collections?.length) {
    filters.collections.forEach(collection => {
      params.append('collection', collection)
    })
  }

  // Price range
  if (filters.priceRange) {
    if (filters.priceRange.min > 0) {
      params.set('price_min', filters.priceRange.min.toString())
    }
    if (filters.priceRange.max < Number.MAX_SAFE_INTEGER) {
      params.set('price_max', filters.priceRange.max.toString())
    }
  }

  // Rating
  if (filters.rating !== undefined) {
    params.set('rating', filters.rating.toString())
  }

  // Availability
  if (filters.availability?.length) {
    filters.availability.forEach(availability => {
      params.append('availability', availability)
    })
  }

  // Tags
  if (filters.tags?.length) {
    filters.tags.forEach(tag => {
      params.append('tag', tag)
    })
  }

  // Facets
  if (filters.facets) {
    Object.entries(filters.facets).forEach(([facetCode, values]) => {
      values.forEach(value => {
        params.append(`facet_${facetCode}`, value)
      })
    })
  }

  return params
}

/**
 * Merges new filters with existing ones
 */
export function mergeFilters(current: FilterState, updates: Partial<FilterState>): FilterState {
  return {
    ...current,
    ...updates,
    // Reset page when filters change (except when only page is being updated)
    page: updates.page !== undefined ? updates.page : 1,
  }
}

/**
 * Removes a specific filter
 */
export function removeFilter(filters: FilterState, filterType: keyof FilterState, value?: any): FilterState {
  const newFilters = { ...filters }

  if (filterType === 'facets' && value) {
    const [facetCode, facetValue] = value
    if (newFilters.facets?.[facetCode]) {
      newFilters.facets[facetCode] = newFilters.facets[facetCode].filter(v => v !== facetValue)
      if (newFilters.facets[facetCode].length === 0) {
        delete newFilters.facets[facetCode]
      }
      if (Object.keys(newFilters.facets).length === 0) {
        delete newFilters.facets
      }
    }
  } else if (filterType === 'collections' && value) {
    if (newFilters.collections) {
      newFilters.collections = newFilters.collections.filter(c => c !== value)
      if (newFilters.collections.length === 0) {
        delete newFilters.collections
      }
    }
  } else if (filterType === 'tags' && value) {
    if (newFilters.tags) {
      newFilters.tags = newFilters.tags.filter(t => t !== value)
      if (newFilters.tags.length === 0) {
        delete newFilters.tags
      }
    }
  } else if (filterType === 'availability' && value) {
    if (newFilters.availability) {
      newFilters.availability = newFilters.availability.filter(a => a !== value)
      if (newFilters.availability.length === 0) {
        delete newFilters.availability
      }
    }
  } else {
    delete newFilters[filterType]
  }

  // Reset to page 1 when removing filters
  newFilters.page = 1

  return newFilters
}

/**
 * Clears all filters except search and sort
 */
export function clearAllFilters(filters: FilterState): FilterState {
  return {
    search: filters.search,
    sort: filters.sort,
    page: 1,
    limit: filters.limit,
  }
}

/**
 * Gets the count of active filters
 */
export function getActiveFilterCount(filters: FilterState): number {
  let count = 0

  if (filters.collections?.length) count += filters.collections.length
  if (filters.facets) {
    count += Object.values(filters.facets).reduce((sum, values) => sum + values.length, 0)
  }
  if (filters.priceRange) count += 1
  if (filters.rating !== undefined) count += 1
  if (filters.availability?.length) count += filters.availability.length
  if (filters.tags?.length) count += filters.tags.length

  return count
}