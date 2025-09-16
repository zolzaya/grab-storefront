import type { ProductListOptions, SearchInput } from './types'
import type { FilterState } from '~/hooks/useFilters'

/**
 * Converts frontend filter state to Vendure GraphQL ProductListOptions
 */
export function buildProductListOptions(
  filters: FilterState,
  take = 12,
  skip = 0,
  defaultCollectionId?: string
): ProductListOptions {
  const options: ProductListOptions = {
    take,
    skip,
    filter: {},
  }

  // Handle sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        options.sort = { price: 'ASC' }
        break
      case 'price-desc':
        options.sort = { price: 'DESC' }
        break
      case 'newest':
        options.sort = { createdAt: 'DESC' }
        break
      case 'popular':
        // In a real implementation, you'd have a popularity field
        options.sort = { name: 'ASC' }
        break
      case 'rating':
        // In a real implementation, you'd have a rating field
        options.sort = { name: 'ASC' }
        break
      case 'discount':
        // In a real implementation, you'd have a discount field
        options.sort = { price: 'DESC' }
        break
      default:
        options.sort = { createdAt: 'DESC' }
    }
  }

  // Handle price range filtering
  if (filters.priceMin || filters.priceMax) {
    options.filter!.variants = {
      priceWithTax: {
        between: {
          start: filters.priceMin || 0,
          end: filters.priceMax || 999999999,
        },
      },
    }
  }

  // Handle brand and product type filtering via facets
  const facetValueIds: string[] = []

  if (filters.brands && filters.brands.length > 0) {
    // In a real implementation, you'd map brand IDs to facet value IDs
    // For now, we'll use the brand IDs directly
    facetValueIds.push(...filters.brands)
  }

  if (filters.productTypes && filters.productTypes.length > 0) {
    // In a real implementation, you'd map product type IDs to facet value IDs
    facetValueIds.push(...filters.productTypes)
  }

  if (facetValueIds.length > 0) {
    options.filter!.facetValueIds = {
      in: facetValueIds,
    }
  }

  return options
}

/**
 * Builds search parameters for the corrected GraphQL query
 */
export function buildSearchParams(
  filters: FilterState,
  searchTerm?: string,
  collectionSlug?: string,
  take = 12,
  skip = 0
) {
  const params: any = {
    take,
    skip,
    groupByProduct: true,
  }

  // Add search term
  if (searchTerm) {
    params.term = searchTerm
  }

  // Add collection filter
  if (collectionSlug) {
    params.collectionSlug = collectionSlug
  }

  // Handle sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        params.sort = { price: 'ASC' }
        break
      case 'price-desc':
        params.sort = { price: 'DESC' }
        break
      case 'newest':
        params.sort = { createdAt: 'DESC' }
        break
      case 'popular':
        params.sort = { name: 'ASC' }
        break
      case 'rating':
        params.sort = { name: 'ASC' }
        break
      case 'discount':
        params.sort = { price: 'DESC' }
        break
      default:
        params.sort = { createdAt: 'DESC' }
    }
  }

  // Handle facet filtering
  const facetValueIds: string[] = []

  if (filters.brands && filters.brands.length > 0) {
    facetValueIds.push(...filters.brands)
  }

  if (filters.productTypes && filters.productTypes.length > 0) {
    facetValueIds.push(...filters.productTypes)
  }

  if (facetValueIds.length > 0) {
    params.facetValueIds = facetValueIds
    params.facetValueOperator = 'OR' // Allow matching any of the selected facets
  }

  return params
}

// Keep the old function for backward compatibility
export function buildSearchInput(
  filters: FilterState,
  searchTerm?: string,
  collectionSlug?: string,
  take = 12,
  skip = 0
): SearchInput {
  return buildSearchParams(filters, searchTerm, collectionSlug, take, skip)
}

/**
 * Maps Vendure facet values to frontend brand/product type options
 */
export function mapFacetValuesToBrands(facetValues: any[]): any[] {
  return facetValues
    .filter(fv => fv.facetValue.facet.code === 'brand')
    .map(fv => ({
      id: fv.facetValue.id,
      name: fv.facetValue.name,
      productCount: fv.count,
      code: fv.facetValue.code,
    }))
}

export function mapFacetValuesToProductTypes(facetValues: any[]): any[] {
  return facetValues
    .filter(fv => fv.facetValue.facet.code === 'product-type')
    .map(fv => ({
      id: fv.facetValue.id,
      name: fv.facetValue.name,
      productCount: fv.count,
      code: fv.facetValue.code,
      description: fv.facetValue.description || '',
    }))
}

/**
 * Generic function to map facet values by facet code
 */
export function mapFacetValuesByCode(facetValues: any[], facetCode: string): any[] {
  return facetValues
    .filter(fv => fv.facetValue.facet.code === facetCode)
    .map(fv => ({
      id: fv.facetValue.id,
      name: fv.facetValue.name,
      productCount: fv.count,
      code: fv.facetValue.code,
      description: fv.facetValue.description || '',
    }))
}

/**
 * Get all available facet types from facet values
 */
export function getAvailableFacetTypes(facetValues: any[]): string[] {
  return [...new Set(facetValues.map(fv => fv.facetValue.facet.code))]
}

/**
 * Extract price range from search results
 */
export function extractPriceRange(searchResults: any[]): { min: number; max: number } {
  if (!searchResults || searchResults.length === 0) {
    return { min: 0, max: 1000000 }
  }

  let min = Infinity
  let max = 0

  searchResults.forEach(result => {
    const price = result.priceWithTax
    if (price) {
      if ('min' in price && 'max' in price) {
        min = Math.min(min, price.min)
        max = Math.max(max, price.max)
      } else if ('value' in price) {
        min = Math.min(min, price.value)
        max = Math.max(max, price.value)
      }
    }
  })

  return {
    min: min === Infinity ? 0 : min,
    max: max || 1000000,
  }
}

/**
 * Build category tree with product counts from collections
 */
export function buildCategoryTree(collections: any[]): any[] {
  const rootCollections = collections.filter(c => !c.parent || c.parent?.name === '__root_collection__')

  return rootCollections.map(collection => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    productCount: collection.productVariants?.totalItems || 0,
    children: buildCategoryChildren(collection.children || [], collections),
  }))
}

function buildCategoryChildren(children: any[], allCollections: any[]): any[] {
  return children.map(child => {
    const fullChild = allCollections.find(c => c.id === child.id) || child
    return {
      id: fullChild.id,
      name: fullChild.name,
      slug: fullChild.slug,
      productCount: fullChild.productVariants?.totalItems || 0,
      children: buildCategoryChildren(fullChild.children || [], allCollections),
    }
  })
}