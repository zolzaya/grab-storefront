import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData, useSearchParams, useNavigate } from '@remix-run/react'
import { useState } from 'react'

import Breadcrumb from '~/components/Breadcrumb'
import PageHeader from '~/components/PageHeader'
import PriceRangeSlider from '~/components/filters/PriceRangeSlider'
import CategorySidebar from '~/components/filters/CategorySidebar'
import ProductTypeFilter from '~/components/filters/ProductTypeFilter'
import FacetFilter from '~/components/filters/FacetFilter'
import ProductCard from '~/components/ProductCard'
import {
  ProductCardSkeleton,
  FilterSkeleton,
  PriceSliderSkeleton,
  CategorySidebarSkeleton,
  PaginationSkeleton,
  PageHeaderSkeleton
} from '~/components/SkeletonLoader'
import { FilterAnnouncement } from '~/components/ScreenReaderAnnouncer'
import { useFilters } from '~/hooks/useFilters'
import { shopApiRequest } from '~/lib/graphql'
import {
  GET_SEARCH_RESULTS,
  GET_COLLECTIONS_TREE,
  GET_FACETS
} from '~/lib/queries'
import {
  mapFacetValuesByCode,
  getAvailableFacetTypes,
  buildCategoryTree,
  extractPriceRange
} from '~/lib/filtering'
import type { ViewMode, SortOption } from '~/components/PageHeader'
import type { CategoryNode } from '~/components/filters/CategorySidebar'
import type { ProductTypeOption } from '~/components/filters/ProductTypeFilter'

// Constants
const SEARCH_CONSTANTS = {
  PRODUCTS_PER_PAGE: 12,
  PRICE_RANGE_PRODUCTS_LIMIT: 1000,
  LOADING_DELAY_MS: 600,
  PRICE_FILTER_DELAY_MS: 800,
  FACETS_LIMIT: 100,
  DEFAULT_PRICE_RANGE: { min: 0, max: 1000000 }
} as const

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

// Transform search results to product format for ProductCard compatibility
const transformSearchItemToProduct = (item: any) => {
  // Handle image asset - check for productAsset or create placeholder
  const imageAsset = item.productAsset ? {
    id: item.productAsset.id,
    preview: item.productAsset.preview
  } : null

  const price = item.price?.value || item.price?.min || 0
  const priceWithTax = item.priceWithTax?.value || item.priceWithTax?.min || 0

  return {
    id: item.productId,
    name: item.productName,
    slug: item.slug,
    description: item.description,
    featuredAsset: imageAsset,
    variants: [{
      id: item.productId + '-variant',
      name: item.productName,
      price: price,
      priceWithTax: priceWithTax,
      sku: item.sku,
      stockLevel: 'IN_STOCK',
      featuredAsset: imageAsset
    }]
  }
}

// Extract facet display names from facet values
const extractFacetDisplayNames = (facetValues: any[]) => {
  const facetDisplayNames: { [key: string]: string } = {}
  facetValues.forEach((fv: any) => {
    const facetCode = fv.facetValue.facet.code
    const facetName = fv.facetValue.facet.name
    if (!facetDisplayNames[facetCode]) {
      facetDisplayNames[facetCode] = capitalize(facetName)
    }
  })
  return facetDisplayNames
}

// Calculate total active filter count
const getActiveFilterCount = (filters: any) => {
  return (filters.facetValueIds?.length || 0) +
         (filters.priceMin ? 1 : 0) +
         (filters.priceMax ? 1 : 0)
}

// Handle loading state for filter actions
const handleFilterLoading = (setLoading: (loading: boolean) => void, action: () => void, delay = SEARCH_CONSTANTS.LOADING_DELAY_MS) => {
  setLoading(true)
  action()
  setTimeout(() => setLoading(false), delay)
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Бүх барааны хайлт | Vendure Storefront' },
    { name: 'description', content: 'Бүх бүтээгдэхүүнийг хайх, шүүх, харьцуулах' },
  ]
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const searchParams = url.searchParams

  // Extract filter parameters from URL
  const filters = {
    priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
    priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    productTypes: searchParams.get('productTypes')?.split(',').filter(Boolean) || [],
    facetValueIds: searchParams.get('fvd')?.split(',').filter(Boolean) || [], // Generic facet value IDs
    sort: searchParams.get('sort') || 'newest',
    collectionId: searchParams.get('collectionId') || undefined,
  }

  const page = parseInt(searchParams.get('page') || '1')
  const take = SEARCH_CONSTANTS.PRODUCTS_PER_PAGE
  const skip = (page - 1) * take

  try {
    // Get search term from URL
    const searchTerm = searchParams.get('q') || ''

    /*
     * DUAL QUERY SYSTEM for better filter UX:
     *
     * 1. PRODUCT QUERY: Applies ALL user filters to get the actual filtered products
     *    - Used for: displaying products, pagination count, total results
     *
     * 2. FILTER OPTIONS QUERY: Applies minimal filters (only collection) to get all available filter options
     *    - Used for: facet values, brands, product types, price ranges
     *    - This ensures filter options remain visible even when other filters are applied
     *    - Prevents the "disappearing facets" UX issue common in e-commerce
     */

    // Build search parameters for filtered products
    const productSearchOptions = {
      term: searchTerm,
      take,
      skip,
      sort: { name: 'ASC' as const },
      groupByProduct: true,
      ...(filters.collectionId && { collectionId: filters.collectionId }),
      ...(filters.facetValueIds.length > 0 && {
        facetValueIds: filters.facetValueIds,
        facetValueOperator: 'OR' as const
      })
    }

    // Build search parameters for filter options (no user filters except collection)
    const filterOptionsSearchOptions = {
      term: searchTerm,
      take: SEARCH_CONSTANTS.PRICE_RANGE_PRODUCTS_LIMIT, // Get more results to ensure we get all filter options
      skip: 0,
      sort: { name: 'ASC' as const },
      groupByProduct: true,
      // Only apply collection filter, no other user filters
      ...(filters.collectionId && { collectionId: filters.collectionId })
    }

    // Fetch both filtered products and unfiltered data for filter options
    const [productSearchResult, filterOptionsResult] = await Promise.all([
      // Filtered products search
      shopApiRequest<{ search: any }>(GET_SEARCH_RESULTS, productSearchOptions, request).catch(() => ({
        search: { items: [], totalItems: 0 }
      })),
      // Unfiltered search for filter options
      shopApiRequest<{ search: any }>(GET_SEARCH_RESULTS, filterOptionsSearchOptions, request).catch(() => ({
        search: { items: [], totalItems: 0 }
      }))
    ])

    // Note: We'll use filterOptionsResult for price range calculation

    // Parallel data fetching for other data
    const [collectionsResult, facetsResult] = await Promise.all([
      // Fetch collections tree for category sidebar
      shopApiRequest<{ collections: any }>(GET_COLLECTIONS_TREE, {}, request).catch(() => ({
        collections: { items: [] }
      })),

      // Fetch available facets for brand/type filtering
      shopApiRequest<{ facets: any }>(GET_FACETS, {
        options: { take: SEARCH_CONSTANTS.FACETS_LIMIT }
      }, request).catch(() => ({ facets: { items: [] } })),
    ])

    // Process the search results and convert to product format
    const searchItems = productSearchResult.search?.items || []
    const totalProducts = productSearchResult.search?.totalItems || 0

    // Use filter options result for facet values (unfiltered to show all available options)
    const facetValues = filterOptionsResult.search?.facetValues || []

    // Debug logging for dual query system
    console.log('Dual query system debug:', {
      searchTerm,
      appliedFilters: filters,
      productResults: {
        totalProducts: productSearchResult.search?.totalItems || 0,
        returnedProducts: productSearchResult.search?.items?.length || 0,
        facetValuesInFiltered: productSearchResult.search?.facetValues?.length || 0
      },
      filterOptions: {
        totalFilterProducts: filterOptionsResult.search?.totalItems || 0,
        returnedFilterProducts: filterOptionsResult.search?.items?.length || 0,
        facetValuesInUnfiltered: filterOptionsResult.search?.facetValues?.length || 0,
        uniqueFacetCodes: [...new Set(facetValues.map((fv: any) => fv.facetValue.facet.code))]
      }
    })


    // Convert search results to product format for ProductCard compatibility
    let products = searchItems.map(transformSearchItemToProduct)

    // Apply client-side price filtering
    if (filters.priceMin || filters.priceMax) {
      products = products.filter((product: any) => {
        const productPrice = product.variants?.[0]?.priceWithTax || 0

        if (filters.priceMin && productPrice < filters.priceMin) {
          return false
        }
        if (filters.priceMax && productPrice > filters.priceMax) {
          return false
        }

        return true
      })
    }

    // Debug: Log all available facets
    console.log('Available facets debug:', {
      facetValuesCount: facetValues.length,
      uniqueFacetCodes: [...new Set(facetValues.map((fv: any) => fv.facetValue.facet.code))],
      sampleFacets: facetValues.slice(0, 5).map((fv: any) => ({
        facetCode: fv.facetValue.facet.code,
        facetName: fv.facetValue.facet.name,
        valueName: fv.facetValue.name,
        count: fv.count
      }))
    })

    // Extract all available facet types and their options
    const availableFacetTypes = getAvailableFacetTypes(facetValues)

    // Map all facet types using generic function (excluding 'category' since we have collection-based categories)
    const brandOptions = mapFacetValuesByCode(facetValues, 'brand')
    const productTypeOptions = mapFacetValuesByCode(facetValues, 'product-type')
    const colorOptions = mapFacetValuesByCode(facetValues, 'color')
    const plantTypeOptions = mapFacetValuesByCode(facetValues, 'plant-type')

    // Get facet names from backend data for display
    const facetDisplayNames = extractFacetDisplayNames(facetValues)

    // Log available facets for debugging
    console.log('Mapped facet options:', {
      brands: brandOptions.length,
      productTypes: productTypeOptions.length,
      colors: colorOptions.length,
      plantTypes: plantTypeOptions.length,
      availableFacetTypes: availableFacetTypes.filter(type => type !== 'category'), // Exclude category from available types
      facetDisplayNames
    })

    // Build category tree from collections
    const categoryTree = buildCategoryTree(collectionsResult.collections?.items || [])

    // Calculate price range from unfiltered products (or collection-filtered if collection is selected)
    const productsForRange = (filterOptionsResult.search?.items || []).map((item: any) => {
      const priceValue = item.priceWithTax?.value || item.priceWithTax?.min || item.price?.value || item.price?.min
      return {
        priceWithTax: { value: priceValue || 0 }
      }
    }).filter(p => p.priceWithTax.value > 0) // Only include products with valid prices

    const priceRange = extractPriceRange(productsForRange)

    // Debug logging for collection-specific price ranges
    if (filters.collectionId) {
      console.log('Collection price range debug:', {
        collectionId: filters.collectionId,
        productCount: productsForRange.length,
        samplePrices: productsForRange.slice(0, 5).map(p => p.priceWithTax.value),
        calculatedRange: priceRange
      })
    }

    // Count filtered products for display, but use server total for pagination
    const filteredProductsCount = products.length

    // Build breadcrumbs (empty array since Breadcrumb component handles Home link automatically)
    const breadcrumbs: any[] = []

    // Enhance products with additional data for display
    const enhancedProducts = products.map((product: any) => ({
      ...product,
      // Add mock enhancement data for display purposes
      // In production, this would come from product custom fields or separate services
      originalPrice: product.variants?.[0]?.priceWithTax * 1.3,
      discountPercent: Math.floor(Math.random() * 30) + 10,
      stockStatus: Math.random() > 0.5 ? 'Завхан онлайнаар' : 'Дэлгүүрээс',
      daysLeft: Math.floor(Math.random() * 15) + 1,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      reviewCount: Math.floor(Math.random() * 50) + 10,
    }))

    // Debug pagination calculation
    console.log('Pagination debug:', {
      originalServerTotal: totalProducts,
      clientFilteredCount: filteredProductsCount,
      take,
      calculatedTotalPages: Math.ceil(totalProducts / take),
      currentPage: page
    })

    // Debug facet filtering
    console.log('Facet filtering debug:', {
      facetValueIds: filters.facetValueIds,
      productSearchOptionsUsed: productSearchOptions,
      filterOptionsSearchOptionsUsed: filterOptionsSearchOptions
    })

    return {
      products: enhancedProducts,
      totalProducts: filteredProductsCount, // Display count (client-side filtered)
      serverTotalProducts: totalProducts, // Server-side total for pagination
      breadcrumbs,
      priceRange: priceRange,
      brandOptions,
      categoryTree,
      productTypeOptions,
      colorOptions,
      plantTypeOptions,
      availableFacetTypes,
      facetDisplayNames,
      currentFilters: filters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / take), // Use server total for pagination
        hasNextPage: skip + take < totalProducts,
        hasPreviousPage: page > 1,
      }
    }

  } catch (error) {
    console.error('Search loader error:', error)

    // Fallback to basic data structure on error
    return {
      products: [],
      totalProducts: 0,
      breadcrumbs: [{ id: '1', name: 'Бүх бараа', slug: 'all-products' }],
      priceRange: SEARCH_CONSTANTS.DEFAULT_PRICE_RANGE,
      brandOptions: [],
      categoryTree: [],
      productTypeOptions: [],
      currentFilters: filters,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      error: 'Failed to load search results'
    }
  }
}

export default function SearchPage() {
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { filters, updatePriceRange, updateSort, toggleProductType, toggleFacetValue, updateCollection } = useFilters()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isFilteringLoading, setIsFilteringLoading] = useState(false)
  const [isProductsLoading, setIsProductsLoading] = useState(false)

  // Helper function to build URLs with current search params
  const buildUrlWithParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value)
    })
    return `?${params.toString()}`
  }

  // Handle potential error state
  if ('error' in loaderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Алдаа гарлаа
            </h1>
            <p className="text-gray-600 mb-4">
              Хайлтын үр дүнг ачаалахад алдаа гарлаа. Дахин оролдоно уу.
            </p>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Дахин ачаалах
            </button>
          </div>
        </div>
      </div>
    )
  }

  const {
    products,
    breadcrumbs,
    totalProducts,
    serverTotalProducts,
    priceRange,
    brandOptions,
    categoryTree,
    productTypeOptions,
    colorOptions,
    plantTypeOptions,
    availableFacetTypes,
    facetDisplayNames,
    pagination
  } = loaderData

  // Get current price range from filters or use defaults
  const currentPriceRange: [number, number] = [
    filters.priceMin ?? priceRange.min,
    filters.priceMax ?? priceRange.max,
  ]

  const currentSort = (filters.sort as SortOption) ?? 'newest'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen Reader Announcements */}
      <FilterAnnouncement totalProducts={totalProducts} isLoading={isFilteringLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb breadcrumbs={breadcrumbs} currentPage="Бүх бараа" />

        {/* Page Header */}
        {isFilteringLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title="Бүх бараа"
            totalProducts={totalProducts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={currentSort}
            onSortChange={(sort) => {
              setIsFilteringLoading(true)
              updateSort(sort)
              setTimeout(() => setIsFilteringLoading(false), 500)
            }}
          />
        )}

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21.586V15.414a1 1 0 00-.293-.707L4.293 8.293A1 1 0 014 7.586V4z" />
            </svg>
            Шүүлтүүр
            {getActiveFilterCount(filters) > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                {getActiveFilterCount(filters)}
              </span>
            )}
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6 sticky top-6">
              {isFilteringLoading ? (
                <>
                  <CategorySidebarSkeleton />
                  <PriceSliderSkeleton />
                  <FilterSkeleton />
                  <FilterSkeleton />
                </>
              ) : (
                <>
                  {/* Category Sidebar */}
                  <div>
                    <CategorySidebar
                      categories={categoryTree}
                      currentCategoryId={filters.collectionId || ""}
                    />
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <PriceRangeSlider
                      min={priceRange.min}
                      max={priceRange.max}
                      value={currentPriceRange}
                      onChange={(value) =>
                        handleFilterLoading(
                          setIsProductsLoading,
                          () => updatePriceRange(value[0], value[1], priceRange.min, priceRange.max),
                          SEARCH_CONSTANTS.PRICE_FILTER_DELAY_MS
                        )
                      }
                      step={1000}
                    />
                  </div>

                  {/* Brand Filter */}
                  {brandOptions.length > 0 && (
                    <div>
                      <FacetFilter
                        title={facetDisplayNames['brand'] || 'Brand'} // Use backend facet name
                        facetCode="brand"
                        options={brandOptions}
                        selectedOptions={filters.facetValueIds || []} // Use generic facet value IDs
                        onOptionToggle={(facetValueId) =>
                          handleFilterLoading(setIsProductsLoading, () => toggleFacetValue(facetValueId))
                        }
                      />
                    </div>
                  )}

                  {/* Product Type Filters */}
                  {productTypeOptions.length > 0 && (
                    <div>
                      <ProductTypeFilter
                        options={productTypeOptions}
                        selectedTypes={filters.productTypes || []}
                        onTypeToggle={(typeId) => {
                          setIsProductsLoading(true)
                          toggleProductType(typeId)
                          setTimeout(() => setIsProductsLoading(false), SEARCH_CONSTANTS.LOADING_DELAY_MS)
                        }}
                      />
                    </div>
                  )}

                  {/* Color Filter */}
                  {colorOptions.length > 0 && (
                    <div>
                      <FacetFilter
                        title={facetDisplayNames['color'] || 'Color'} // Use backend facet name
                        facetCode="color"
                        options={colorOptions}
                        selectedOptions={filters.facetValueIds || []} // Use generic facet value IDs
                        onOptionToggle={(facetValueId) =>
                          handleFilterLoading(setIsProductsLoading, () => toggleFacetValue(facetValueId))
                        }
                      />
                    </div>
                  )}


                  {/* Plant Type Filter */}
                  {plantTypeOptions.length > 0 && (
                    <div>
                      <FacetFilter
                        title={facetDisplayNames['plant-type'] || 'Plant Type'} // Use backend facet name
                        facetCode="plant-type"
                        options={plantTypeOptions}
                        selectedOptions={filters.facetValueIds || []} // Use generic facet value IDs
                        onOptionToggle={(facetValueId) =>
                          handleFilterLoading(setIsProductsLoading, () => toggleFacetValue(facetValueId))
                        }
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {(isFilteringLoading || isProductsLoading) ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-4'
              }>
                {[...Array(12)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-4'
              }>
                {products.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(isFilteringLoading || isProductsLoading) ? (
              <div className="mt-12">
                <PaginationSkeleton />
              </div>
            ) : (
              pagination.totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center space-y-4">
                  {/* Results Summary */}
                  <div className="text-sm text-gray-600 text-center">
                    {totalProducts > 0 && (
                      <p>
                        {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, totalProducts)} / {totalProducts.toLocaleString()} бүтээгдэхүүн
                      </p>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    {pagination.hasPreviousPage ? (
                      <a
                        href={buildUrlWithParams({
                          page: (pagination.currentPage - 1).toString()
                        })}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Өмнөх
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
                        Өмнөх
                      </span>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum: number
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }

                      return (
                        <a
                          key={pageNum}
                          href={buildUrlWithParams({
                            page: pageNum.toString()
                          })}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === pagination.currentPage
                            ? 'text-white bg-red-600 border-red-600'
                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            } border`}
                        >
                          {pageNum}
                        </a>
                      )
                    })}

                    {/* Show ellipsis and last page if needed */}
                    {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-3 py-2 text-sm font-medium text-gray-500">...</span>
                        <a
                          href={buildUrlWithParams({
                            page: pagination.totalPages.toString()
                          })}
                          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {pagination.totalPages}
                        </a>
                      </>
                    )}

                    {/* Next Button */}
                    {pagination.hasNextPage ? (
                      <a
                        href={buildUrlWithParams({
                          page: (pagination.currentPage + 1).toString()
                        })}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Дараах
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed">
                        Дараах
                      </span>
                    )}
                  </div>
                </div>
              )
            )}

            {/* No Results Message */}
            {totalProducts === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Илэрц олдсонгүй
                  </h3>
                  <p className="text-gray-600">
                    Таны шүүлтүүрт тохирох бүтээгдэхүүн олдсонгүй. Шүүлтүүрээ өөрчилж үзнэ үү.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-xl transform transition-transform">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Шүүлтүүр</h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Category Sidebar */}
                <div>
                  <CategorySidebar
                    categories={categoryTree}
                    currentCategoryId={filters.collectionId || ""}
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <PriceRangeSlider
                    min={priceRange.min}
                    max={priceRange.max}
                    value={currentPriceRange}
                    onChange={(value) => {
                      setIsProductsLoading(true)
                      updatePriceRange(value[0], value[1], priceRange.min, priceRange.max)
                      setTimeout(() => setIsProductsLoading(false), 800)
                    }}
                    step={1000}
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <FacetFilter
                    title={facetDisplayNames['brand'] || 'Brand'} // Use backend facet name
                    facetCode="brand"
                    options={brandOptions}
                    selectedOptions={filters.facetValueIds || []} // Use generic facet value IDs
                    onOptionToggle={(facetValueId) => {
                      toggleFacetValue(facetValueId)
                    }}
                  />
                </div>

                {/* Product Type Filters */}
                <div>
                  <ProductTypeFilter
                    options={productTypeOptions}
                    selectedTypes={filters.productTypes || []}
                    onTypeToggle={toggleProductType}
                  />
                </div>
              </div>

              {/* Footer with Clear/Apply */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                <button
                  onClick={() => {
                    // Clear all filters and navigate to search page without params
                    navigate('/search')
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Бүгдийг арилгах
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  Хайх ({totalProducts.toLocaleString()} бүтээгдэхүүн)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}