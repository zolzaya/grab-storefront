import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData, useSearchParams, useNavigate } from '@remix-run/react'
import { useState } from 'react'

import Breadcrumb from '~/components/Breadcrumb'
import PageHeader from '~/components/PageHeader'
import PriceRangeSlider from '~/components/filters/PriceRangeSlider'
import CategorySidebar from '~/components/filters/CategorySidebar'
import BrandFilter from '~/components/filters/BrandFilter'
import ProductTypeFilter from '~/components/filters/ProductTypeFilter'
import ProductCard from '~/components/ProductCard'
import {
  ProductCardSkeleton,
  FilterSkeleton,
  PriceSliderSkeleton,
  CategorySidebarSkeleton,
  BrandFilterSkeleton,
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
  mapFacetValuesToBrands,
  mapFacetValuesToProductTypes,
  buildCategoryTree,
  extractPriceRange
} from '~/lib/filtering'
import type { ViewMode, SortOption } from '~/components/PageHeader'
import type { CategoryNode } from '~/components/filters/CategorySidebar'
import type { Brand } from '~/components/filters/BrandFilter'
import type { ProductTypeOption } from '~/components/filters/ProductTypeFilter'

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
    sort: searchParams.get('sort') || 'newest',
  }

  const page = parseInt(searchParams.get('page') || '1')
  const take = 12
  const skip = (page - 1) * take

  try {
    // Get search term from URL
    const searchTerm = searchParams.get('q') || ''

    // Build search parameters
    const searchOptions = {
      term: searchTerm,
      take,
      skip,
      sort: { name: 'ASC' as const },
      groupByProduct: true
    }

    // Fetch search results
    const searchResult = await shopApiRequest<{ search: any }>(GET_SEARCH_RESULTS, searchOptions, request).catch(() => ({
      search: { items: [], totalItems: 0 }
    }))

    // Parallel data fetching for other data
    const [collectionsResult, facetsResult] = await Promise.all([
      // Fetch collections tree for category sidebar
      shopApiRequest<{ collections: any }>(GET_COLLECTIONS_TREE, {}, request).catch(() => ({
        collections: { items: [] }
      })),

      // Fetch available facets for brand/type filtering
      shopApiRequest<{ facets: any }>(GET_FACETS, {
        options: { take: 100 }
      }, request).catch(() => ({ facets: { items: [] } })),
    ])

    // Process the search results and convert to product format
    const searchItems = searchResult.search?.items || []
    const totalProducts = searchResult.search?.totalItems || 0
    const facetValues = searchResult.search?.facetValues || []


    // Convert search results to product format for ProductCard compatibility
    const products = searchItems.map((item: any) => {
      // Handle image asset - check for productAsset or create placeholder
      const imageAsset = item.productAsset ? {
        id: item.productAsset.id,
        preview: item.productAsset.preview
      } : null


      return {
        id: item.productId,
        name: item.productName,
        slug: item.slug,
        description: item.description,
        featuredAsset: imageAsset,
        variants: [{
          id: item.productId + '-variant',
          name: item.productName,
          price: item.price?.value || item.price?.min || 0,
          priceWithTax: item.priceWithTax?.value || item.priceWithTax?.min || 0,
          sku: item.sku,
          stockLevel: 'IN_STOCK',
          featuredAsset: imageAsset
        }]
      }
    })

    // Extract brands and product types from facets
    const brands = mapFacetValuesToBrands(facetValues)
    const productTypeOptions = mapFacetValuesToProductTypes(facetValues)

    // Build category tree from collections
    const categoryTree = buildCategoryTree(collectionsResult.collections?.items || [])

    // Calculate price range from current products
    const priceRange = extractPriceRange(products.map((p: any) => ({
      priceWithTax: { value: p.variants?.[0]?.priceWithTax || 0 }
    })))

    // Build breadcrumbs
    const breadcrumbs = [
      { id: '1', name: 'Нүүр', slug: '/' },
    ]

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

    return {
      products: enhancedProducts,
      totalProducts,
      breadcrumbs,
      priceRange: priceRange.min > 0 ? priceRange : { min: 2700, max: 28000000 },
      brands,
      categoryTree,
      productTypeOptions,
      currentFilters: filters,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / take),
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
      priceRange: { min: 0, max: 1000000 },
      brands: [],
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
  const { filters, updatePriceRange, updateSort, toggleBrand, toggleProductType } = useFilters()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isFilteringLoading, setIsFilteringLoading] = useState(false)

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
    priceRange,
    brands,
    categoryTree,
    productTypeOptions,
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
            {(filters.brands?.length || 0) + (filters.productTypes?.length || 0) + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0) > 0 && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                {(filters.brands?.length || 0) + (filters.productTypes?.length || 0) + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0)}
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
                  <BrandFilterSkeleton />
                  <FilterSkeleton />
                </>
              ) : (
                <>
                  {/* Category Sidebar */}
                  <div>
                    <CategorySidebar
                      categories={categoryTree}
                      currentCategoryId="" // No specific collection selected
                    />
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <PriceRangeSlider
                      min={priceRange.min}
                      max={priceRange.max}
                      value={currentPriceRange}
                      onChange={(value) => {
                        setIsFilteringLoading(true)
                        updatePriceRange(value[0], value[1], priceRange.min, priceRange.max)
                        setTimeout(() => setIsFilteringLoading(false), 800)
                      }}
                      step={1000}
                    />
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <BrandFilter
                      brands={brands}
                      selectedBrands={filters.brands || []}
                      onBrandToggle={(brandId) => {
                        setIsFilteringLoading(true)
                        toggleBrand(brandId)
                        setTimeout(() => setIsFilteringLoading(false), 600)
                      }}
                      showProductCount={true}
                    />
                  </div>

                  {/* Product Type Filters */}
                  <div>
                    <ProductTypeFilter
                      options={productTypeOptions}
                      selectedTypes={filters.productTypes || []}
                      onTypeToggle={(typeId) => {
                        setIsFilteringLoading(true)
                        toggleProductType(typeId)
                        setTimeout(() => setIsFilteringLoading(false), 600)
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isFilteringLoading ? (
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
            {isFilteringLoading ? (
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
                    currentCategoryId=""
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <PriceRangeSlider
                    min={priceRange.min}
                    max={priceRange.max}
                    value={currentPriceRange}
                    onChange={(value) => updatePriceRange(value[0], value[1], priceRange.min, priceRange.max)}
                    step={1000}
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <BrandFilter
                    brands={brands}
                    selectedBrands={filters.brands || []}
                    onBrandToggle={toggleBrand}
                    showProductCount={true}
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