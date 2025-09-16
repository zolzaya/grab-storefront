import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
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
  GET_COLLECTION_WITH_PRODUCTS,
  GET_COLLECTIONS_TREE,
  GET_FACETS
} from '~/lib/queries'
import {
  buildProductListOptions,
  mapFacetValuesToBrands,
  mapFacetValuesToProductTypes,
  buildCategoryTree,
  extractPriceRange
} from '~/lib/filtering'
import type { ViewMode, SortOption } from '~/components/PageHeader'
import type { CategoryNode } from '~/components/filters/CategorySidebar'
import type { Brand } from '~/components/filters/BrandFilter'
import type { ProductTypeOption } from '~/components/filters/ProductTypeFilter'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.collection) {
    return [
      { title: 'Collection Not Found | Vendure Storefront' },
      { name: 'description', content: 'The requested collection could not be found.' },
    ]
  }

  return [
    { title: `${data.collection.name} | Vendure Storefront` },
    { name: 'description', content: data.collection.description || `Browse ${data.collection.name} products` },
  ]
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { slug } = params
  if (!slug) {
    throw new Response('Collection slug is required', { status: 400 })
  }

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
    // Build GraphQL options for product filtering
    const productOptions = buildProductListOptions(filters, take, skip)

    // Parallel data fetching
    const [collectionResult, collectionsTreeResult, facetsResult] = await Promise.all([
      // Fetch collection with filtered products
      shopApiRequest<{ collection: any }>(GET_COLLECTION_WITH_PRODUCTS, {
        slug,
        options: productOptions
      }, request).catch(() => ({ collection: null })),

      // Fetch collections tree for category sidebar
      shopApiRequest<{ collections: any }>(GET_COLLECTIONS_TREE, {}, request).catch(() => ({
        collections: { items: [] }
      })),

      // Fetch available facets for brand/type filtering
      shopApiRequest<{ facets: any }>(GET_FACETS, {
        options: { take: 100 }
      }, request).catch(() => ({ facets: { items: [] } })),
    ])

    const collection = collectionResult.collection
    if (!collection) {
      throw new Response('Collection not found', { status: 404 })
    }

    // Process the results
    const products = collection.productVariants?.items?.map((variant: any) => variant.product) || []
    const totalProducts = collection.productVariants?.totalItems || 0
    const facetValues = collection.productVariants?.facetValues || []

    // Extract brands and product types from facets
    const brands = mapFacetValuesToBrands(facetValues)
    const productTypeOptions = mapFacetValuesToProductTypes(facetValues)

    // Build category tree from collections
    const categoryTree = buildCategoryTree(collectionsTreeResult.collections?.items || [])

    // Calculate price range from current products
    const priceRange = extractPriceRange(products.map((p: any) => ({
      priceWithTax: { value: p.variants?.[0]?.priceWithTax || 0 }
    })))

    // Enhance products with additional data for display
    const enhancedProducts = products.map((product: any) => ({
      ...product,
      // Add enhancement data for display
      originalPrice: product.variants?.[0]?.priceWithTax * 1.3,
      discountPercent: Math.floor(Math.random() * 30) + 10,
      stockStatus: Math.random() > 0.5 ? 'Завхан онлайнаар' : 'Дэлгүүрээс',
      daysLeft: Math.floor(Math.random() * 15) + 1,
      rating: Math.floor(Math.random() * 2) + 4,
      reviewCount: Math.floor(Math.random() * 50) + 10,
    }))

    return json({
      collection: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        featuredAsset: collection.featuredAsset,
      },
      products: enhancedProducts,
      totalProducts,
      breadcrumbs: collection.breadcrumbs || [],
      priceRange: priceRange.min > 0 ? priceRange : { min: 0, max: 1000000 },
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
    })

  } catch (error) {
    console.error('Collection loader error:', error)

    if (error instanceof Response) {
      throw error
    }

    // Fallback to error state
    return json({
      collection: null,
      products: [],
      totalProducts: 0,
      breadcrumbs: [],
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
      error: 'Failed to load collection'
    }, { status: 500 })
  }
}

export default function CollectionPage() {
  const loaderData = useLoaderData<typeof loader>()
  const { filters, updatePriceRange, updateSort, toggleBrand, toggleProductType } = useFilters()

  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isFilteringLoading, setIsFilteringLoading] = useState(false)

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
              Ангиллыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.
            </p>
            <button
              onClick={() => window.location.reload()}
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
    collection,
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
        <Breadcrumb breadcrumbs={breadcrumbs} currentPage={collection.name} />

        {/* Page Header */}
        {isFilteringLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <PageHeader
            title={collection.name}
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
                      currentCategoryId={collection.id}
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
                  {brands.length > 0 && (
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
                  )}

                  {/* Product Type Filters */}
                  {productTypeOptions.length > 0 && (
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
                  )}
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
                  <div className="text-sm text-gray-600 text-center">
                    {totalProducts > 0 && (
                      <p>
                        {((pagination.currentPage - 1) * 12) + 1}-{Math.min(pagination.currentPage * 12, totalProducts)} / {totalProducts.toLocaleString()} бүтээгдэхүүн
                      </p>
                    )}
                  </div>
                </div>
              )
            )}

            {/* No Results Message */}
            {totalProducts === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Энэ ангилалд бүтээгдэхүүн байхгүй байна
                  </h3>
                  <p className="text-gray-600">
                    Өөр ангиллыг шалгаж үзнэ үү эсвэл шүүлтүүрээ өөрчилж үзнэ үү.
                  </p>
                </div>
              </div>
            )}
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
                      currentCategoryId={collection.id}
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
                  {brands.length > 0 && (
                    <div>
                      <BrandFilter
                        brands={brands}
                        selectedBrands={filters.brands || []}
                        onBrandToggle={toggleBrand}
                        showProductCount={true}
                      />
                    </div>
                  )}

                  {/* Product Type Filters */}
                  {productTypeOptions.length > 0 && (
                    <div>
                      <ProductTypeFilter
                        options={productTypeOptions}
                        selectedTypes={filters.productTypes || []}
                        onTypeToggle={toggleProductType}
                      />
                    </div>
                  )}
                </div>

                {/* Footer with Clear/Apply */}
                <div className="border-t border-gray-200 p-4 space-y-3">
                  <button
                    onClick={() => {
                      // Clear all filters
                      const url = new URL(window.location.href)
                      url.search = ''
                      window.location.href = url.toString()
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
    </div>
  )
}