import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"

import { useLoaderData, useSearchParams } from "@remix-run/react"
import { ProductCard } from "~/components/ProductCard"
import { SortDropdown } from "~/components/SortDropdown"
import { ViewToggle, type ViewMode, getGridClasses, useResponsiveView } from "~/components/ViewToggle"
import { Pagination, useScrollMemory } from "~/components/Pagination"
import { CategorySidebar, CategoryBreadcrumbs } from "~/components/CategorySidebar"
import { PriceRangeFilter } from "~/components/filters/PriceRangeFilter"
import { ColorFilter } from "~/components/filters/ColorFilter"
import { SizeFilter } from "~/components/filters/SizeFilter"
import { BrandFilter } from "~/components/filters/BrandFilter"
import { RatingFilter } from "~/components/filters/RatingFilter"
import { shopApiRequest } from "~/lib/graphql"
import { GET_PRODUCTS, GET_COLLECTIONS, SEARCH_PRODUCTS } from "~/lib/queries"
import { ProductList, Collection, FilterState, PriceRange } from "~/lib/types"
import { useState, useMemo } from "react"

export const meta: MetaFunction = () => {
  return [
    { title: "Products - Your Store" },
    { name: "description", content: "Browse our complete collection of products" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const search = url.searchParams.get("search") || ""
  const collection = url.searchParams.get("collection") || ""
  const sort = url.searchParams.get("sort") || "relevance"
  const page = parseInt(url.searchParams.get("page") || "1")
  const limit = parseInt(url.searchParams.get("limit") || "12")
  const view = (url.searchParams.get("view") || "grid") as ViewMode
  const skip = (page - 1) * limit

  try {
    // Enhanced sort options with new Shopify-style sorting
    const getSortOptions = (sortValue: string) => {
      switch (sortValue) {
        case "name-asc":
          return { name: "ASC" as const }
        case "name-desc":
          return { name: "DESC" as const }
        case "price-low":
          return { price: "ASC" as const }
        case "price-high":
          return { price: "DESC" as const }
        case "newest":
          return { createdAt: "DESC" as const }
        case "oldest":
          return { createdAt: "ASC" as const }
        case "rating-high":
          return { reviewRating: "DESC" as const }
        case "most-reviewed":
          return { reviewCount: "DESC" as const }
        case "bestselling":
          // For now, sort by creation date as a proxy for bestselling
          // In a real app, this would be a calculated field
          return { createdAt: "DESC" as const }
        case "trending":
          // Sort by recently updated as a proxy for trending
          return { updatedAt: "DESC" as const }
        case "featured":
          // Sort by newest as a proxy for featured
          return { createdAt: "DESC" as const }
        case "most-popular":
        case "staff-picks":
        case "customer-favorites":
          // These would require custom fields in a real implementation
          return { createdAt: "DESC" as const }
        default:
          return undefined // relevance - no sorting
      }
    }

    const sortOptions = getSortOptions(sort)

    // Use different approaches for collection filtering vs normal product listing
    let productsResult

    if (collection) {
      // Use search API for collection filtering - this is more reliable
      const searchInput = {
        collectionSlug: collection,
        groupByProduct: true,
        take: limit,
        skip,
        ...(search && { term: search })
      }

      console.log('Using search API with input:', searchInput)

      const searchResult = await shopApiRequest<{ search: any }>(
        SEARCH_PRODUCTS,
        { input: searchInput },
        request
      )

      console.log('Search result:', searchResult.search.items.length, 'items found')

      // Transform search results to match ProductList format
      const transformedProducts = searchResult.search.items.map((item: any) => ({
        id: item.productId,
        name: item.productName,
        slug: item.slug,
        description: item.description || '',
        featuredAsset: item.productAsset ? {
          id: item.productAsset.id,
          preview: item.productAsset.preview
        } : null,
        assets: item.productAsset ? [{
          id: item.productAsset.id,
          preview: item.productAsset.preview
        }] : [],
        variants: [{
          id: item.productVariantId || item.productId,
          name: item.productVariantName || item.productName,
          price: typeof item.price === 'object' ? item.price.min : item.price,
          priceWithTax: typeof item.priceWithTax === 'object' ? item.priceWithTax.min : item.priceWithTax,
          sku: item.sku || '',
          stockLevel: item.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
          featuredAsset: item.productAsset
        }],
        collections: [],
        facetValues: [],
        enabled: item.enabled !== false
      }))

      productsResult = {
        products: {
          items: transformedProducts,
          totalItems: searchResult.search.totalItems
        }
      }
    } else {
      // Use regular products query
      const options = {
        take: limit,
        skip,
        ...(sortOptions && { sort: sortOptions }),
        ...(search && {
          filter: {
            name: { contains: search }
          }
        })
      }

      console.log('Using regular products query with options:', options)

      productsResult = await shopApiRequest<{ products: ProductList }>(
        GET_PRODUCTS,
        { options },
        request
      )
    }

    // Fetch collections data (if not already fetched)
    let collectionsData
    if (collection) {
      // Collections already fetched above, get them again to be consistent
      collectionsData = await shopApiRequest<{ collections: { items: Collection[] } }>(
        GET_COLLECTIONS,
        { options: { take: 100 } },
        request
      ).catch(() => ({ collections: { items: [] } }))
    } else {
      collectionsData = await shopApiRequest<{ collections: { items: Collection[] } }>(
        GET_COLLECTIONS,
        { options: { take: 100 } },
        request
      ).catch(() => ({ collections: { items: [] } }))
    }

    const { products } = productsResult

    return ({
      products,
      collections: collectionsData.collections.items,
      currentPage: page,
      totalPages: Math.ceil(products.totalItems / limit),
      search,
      collection,
      sort,
      view,
      limit
    })
  } catch (error) {
    console.error('Failed to load products:', error)
    return ({
      products: { items: [], totalItems: 0 },
      collections: [],
      currentPage: 1,
      totalPages: 1,
      search,
      collection,
      sort,
      view,
      limit
    })
  }
}

export default function Products() {
  const { products, collections, currentPage, totalPages, search, collection, sort, view, limit } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentView, setCurrentView] = useState<ViewMode>(view)
  const responsiveView = useResponsiveView(currentView)
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search,
    collections: collection ? [collection] : [],
    facets: {},
    priceRange: undefined,
    availability: [],
    rating: undefined
  })
  
  // Mock data for filters - in real app this would come from the API
  const mockPriceRange: PriceRange = { min: 0, max: 1000 }
  const mockColorValues = [
    { facetValue: { id: '1', name: 'Black', code: 'black', facet: { id: '1', name: 'Color', code: 'color' } }, count: 45 },
    { facetValue: { id: '2', name: 'White', code: 'white', facet: { id: '1', name: 'Color', code: 'color' } }, count: 32 },
    { facetValue: { id: '3', name: 'Blue', code: 'blue', facet: { id: '1', name: 'Color', code: 'color' } }, count: 28 },
    { facetValue: { id: '4', name: 'Red', code: 'red', facet: { id: '1', name: 'Color', code: 'color' } }, count: 15 }
  ]
  const mockSizeValues = [
    { facetValue: { id: '1', name: 'XS', code: 'xs', facet: { id: '2', name: 'Size', code: 'size' } }, count: 12 },
    { facetValue: { id: '2', name: 'S', code: 's', facet: { id: '2', name: 'Size', code: 'size' } }, count: 25 },
    { facetValue: { id: '3', name: 'M', code: 'm', facet: { id: '2', name: 'Size', code: 'size' } }, count: 40 },
    { facetValue: { id: '4', name: 'L', code: 'l', facet: { id: '2', name: 'Size', code: 'size' } }, count: 35 },
    { facetValue: { id: '5', name: 'XL', code: 'xl', facet: { id: '2', name: 'Size', code: 'size' } }, count: 18 }
  ]
  const mockBrandValues = [
    { facetValue: { id: '1', name: 'Nike', code: 'nike', facet: { id: '3', name: 'Brand', code: 'brand' } }, count: 25 },
    { facetValue: { id: '2', name: 'Adidas', code: 'adidas', facet: { id: '3', name: 'Brand', code: 'brand' } }, count: 20 },
    { facetValue: { id: '3', name: 'Puma', code: 'puma', facet: { id: '3', name: 'Brand', code: 'brand' } }, count: 15 }
  ]

  // Remember scroll position
  useScrollMemory('products')

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const searchTerm = formData.get("search") as string

    const newParams = new URLSearchParams(searchParams)
    if (searchTerm) {
      newParams.set("search", searchTerm)
    } else {
      newParams.delete("search")
    }
    newParams.delete("page") // Reset to page 1 when searching

    setSearchParams(newParams)
  }

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("page", page.toString())
    setSearchParams(newParams)
  }

  const handleSortChange = (sortValue: string) => {
    const newParams = new URLSearchParams(searchParams)

    if (sortValue === "relevance") {
      newParams.delete("sort")
    } else {
      newParams.set("sort", sortValue)
    }
    newParams.delete("page") // Reset to page 1 when sorting

    setSearchParams(newParams)
  }

  const handleViewChange = (newView: ViewMode) => {
    setCurrentView(newView)
    const newParams = new URLSearchParams(searchParams)

    if (newView === "grid") {
      newParams.delete("view")
    } else {
      newParams.set("view", newView)
    }

    setSearchParams(newParams)
  }

  const handleItemsPerPageChange = (newLimit: number) => {
    const newParams = new URLSearchParams(searchParams)

    if (newLimit === 12) {
      newParams.delete("limit")
    } else {
      newParams.set("limit", newLimit.toString())
    }
    newParams.delete("page") // Reset to page 1 when changing items per page

    setSearchParams(newParams)
  }

  const handleCategoryChange = (categorySlug: string | null) => {
    const newParams = new URLSearchParams(searchParams)

    if (categorySlug) {
      newParams.set("collection", categorySlug)
    } else {
      newParams.delete("collection")
    }
    newParams.delete("page") // Reset to page 1 when changing category

    setSearchParams(newParams)
  }
  
  // Filter handlers
  const handlePriceRangeChange = (range?: PriceRange) => {
    setFilters({ ...filters, priceRange: range })
    // TODO: Apply filters to URL params and reload data
  }
  
  const handleColorChange = (colorIds: string[]) => {
    const newFacets = { ...filters.facets }
    if (colorIds.length > 0) {
      newFacets.color = colorIds
    } else {
      delete newFacets.color
    }
    setFilters({ ...filters, facets: newFacets })
    // TODO: Apply filters to URL params and reload data
  }
  
  const handleSizeChange = (sizeIds: string[]) => {
    const newFacets = { ...filters.facets }
    if (sizeIds.length > 0) {
      newFacets.size = sizeIds
    } else {
      delete newFacets.size
    }
    setFilters({ ...filters, facets: newFacets })
    // TODO: Apply filters to URL params and reload data
  }
  
  const handleBrandChange = (brandIds: string[]) => {
    const newFacets = { ...filters.facets }
    if (brandIds.length > 0) {
      newFacets.brand = brandIds
    } else {
      delete newFacets.brand
    }
    setFilters({ ...filters, facets: newFacets })
    // TODO: Apply filters to URL params and reload data
  }
  
  const handleRatingChange = (rating?: number) => {
    setFilters({ ...filters, rating })
    // TODO: Apply filters to URL params and reload data
  }

  // Calculate grid classes based on responsive view
  const gridClasses = useMemo(() => {
    return getGridClasses(responsiveView)
  }, [responsiveView])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Breadcrumbs */}
        {collection && (
          <div className="mb-6">
            <CategoryBreadcrumbs
              collections={collections}
              currentCollection={collection}
              className="text-sm"
            />
          </div>
        )}

        {/* Header Section */}
        <div className="mb-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Our Products
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover our curated collection of premium products designed to enhance your lifestyle
            </p>
          </div>

          {/* Enhanced Search */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search for products..."
                  className="block w-full pl-14 pr-32 py-4 text-lg border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200 bg-white shadow-soft"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-2 rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Search suggestions */}
            <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
              <span className="text-neutral-600">Popular:</span>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Electronics</button>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Clothing</button>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Home & Garden</button>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Category Sidebar and Filters */}
          <aside className="lg:w-80 flex-shrink-0 space-y-6">
            <CategorySidebar
              collections={collections}
              currentCollection={collection}
              onCategoryChange={handleCategoryChange}
            />
            
            {/* Facet Filters */}
            <div className="bg-white rounded-2xl shadow-soft p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                <button 
                  onClick={() => setFilters({
                    search: filters.search,
                    collections: filters.collections,
                    facets: {},
                    priceRange: undefined,
                    availability: [],
                    rating: undefined
                  })}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              {/* Price Range Filter */}
              <div className="space-y-4">
                <PriceRangeFilter
                  priceRange={mockPriceRange}
                  currentRange={filters.priceRange}
                  onChange={handlePriceRangeChange}
                />
              </div>
              
              {/* Color Filter */}
              <div className="space-y-4">
                <ColorFilter
                  colorValues={mockColorValues}
                  selectedColors={filters.facets?.color || []}
                  onChange={handleColorChange}
                />
              </div>
              
              {/* Size Filter */}
              <div className="space-y-4">
                <SizeFilter
                  sizeValues={mockSizeValues}
                  selectedSizes={filters.facets?.size || []}
                  onChange={handleSizeChange}
                />
              </div>
              
              {/* Brand Filter */}
              <div className="space-y-4">
                <BrandFilter
                  brandValues={mockBrandValues}
                  selectedBrands={filters.facets?.brand || []}
                  onChange={handleBrandChange}
                />
              </div>
              
              {/* Rating Filter */}
              <div className="space-y-4">
                <RatingFilter
                  selectedRating={filters.rating}
                  onChange={handleRatingChange}
                />
              </div>
            </div>
          </aside>

          {/* Products Content */}
          <main className="flex-1 min-w-0">
            {/* Filters and Results Info */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 p-6 bg-white rounded-2xl shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Results Info */}
                <div className="text-neutral-700">
                  <span className="font-semibold">{products.totalItems}</span> products found
                  {search && (
                    <span className="text-neutral-500"> for &ldquo;{search}&rdquo;</span>
                  )}
                  {collection && (
                    <span className="text-neutral-500"> in category</span>
                  )}
                </div>

                {/* Enhanced Sort Options */}
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-neutral-700">Sort by:</label>
                  <SortDropdown
                    currentSort={sort}
                    onSortChange={handleSortChange}
                    showCategories={true}
                  />
                </div>
              </div>

              {/* Enhanced View Toggle */}
              <ViewToggle
                currentView={currentView}
                onViewChange={handleViewChange}
                availableViews={['grid', 'list']}
                className="mt-4 lg:mt-0"
              />
            </div>

            {products.items.length > 0 ? (
              <>
                {/* Products Grid with Dynamic Layout */}
                <div className={`${gridClasses} mb-16`}>
                  {products.items.map((product: any, index: number) => (
                    <div
                      key={product.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        product={product}
                        viewMode={responsiveView}
                        showQuickAdd={true}
                        showWishlist={true}
                        showVariants={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Enhanced Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={products.totalItems}
                  itemsPerPage={limit}
                  onPageChange={goToPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  style="standard"
                />
              </>
            ) : (
              <div className="text-center py-24 animate-fade-in">
                <div className="bg-white rounded-3xl shadow-soft p-16 max-w-lg mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                    {search ? `No products found for "${search}"` : collection ? `No products in this category` : "No products available"}
                  </h3>
                  <p className="text-neutral-600 mb-8">
                    {search
                      ? "Try adjusting your search terms or browse our categories"
                      : collection
                        ? "Try browsing other categories or clear your selection"
                        : "Check back later for new products or contact us for assistance"
                    }
                  </p>
                  {(search || collection) && (
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams()
                        setSearchParams(newParams)
                      }}
                      className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium"
                    >
                      {search ? 'Clear Search' : 'Show All Products'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}