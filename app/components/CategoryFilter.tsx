import { useState, useCallback } from "react"
import { Link } from "@remix-run/react"
import type { Collection } from "~/lib/types"

interface CategoryFilterProps {
  collections: Collection[]
  selectedCollections?: string[]
  currentCollection?: Collection
  onCollectionSelect?: (slug: string) => void
  showProductCounts?: boolean
  showBreadcrumbs?: boolean
  className?: string
}

interface CategoryTreeProps {
  collections: Collection[]
  selectedCollections: string[]
  onCollectionSelect: (slug: string) => void
  showProductCounts: boolean
  level?: number
}

function CategoryTree({ 
  collections, 
  selectedCollections, 
  onCollectionSelect, 
  showProductCounts,
  level = 0 
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((slug: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }, [])

  // Filter to only show top-level categories (no parent) or children of expanded categories
  const rootCollections = collections.filter(c => !c.parent)
  
  return (
    <div className="space-y-1">
      {rootCollections.map((collection) => (
        <CategoryItem
          key={collection.id}
          collection={collection}
          allCollections={collections}
          selectedCollections={selectedCollections}
          onCollectionSelect={onCollectionSelect}
          showProductCounts={showProductCounts}
          level={level}
          isExpanded={expandedCategories.has(collection.slug)}
          onToggleExpanded={toggleExpanded}
        />
      ))}
    </div>
  )
}

function CategoryItem({
  collection,
  allCollections,
  selectedCollections,
  onCollectionSelect,
  showProductCounts,
  level,
  isExpanded,
  onToggleExpanded
}: {
  collection: Collection
  allCollections: Collection[]
  selectedCollections: string[]
  onCollectionSelect: (slug: string) => void
  showProductCounts: boolean
  level: number
  isExpanded: boolean
  onToggleExpanded: (slug: string) => void
}) {
  const hasChildren = collection.children && collection.children.length > 0
  const isSelected = selectedCollections.includes(collection.slug)
  
  const paddingLeft = level * 16

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleExpanded(collection.slug)
  }, [collection.slug, onToggleExpanded])

  const handleSelect = useCallback(() => {
    onCollectionSelect(collection.slug)
  }, [collection.slug, onCollectionSelect])

  return (
    <div>
      <div 
        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-neutral-50 ${
          isSelected ? 'bg-brand-50 text-brand-700' : 'text-neutral-700 hover:text-neutral-900'
        }`}
        style={{ paddingLeft: paddingLeft + 8 }}
        onClick={handleSelect}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {hasChildren && (
            <button
              onClick={handleToggle}
              className="p-1 hover:bg-neutral-200 rounded transition-colors duration-200"
            >
              <svg 
                className={`w-3 h-3 transform transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {collection.featuredAsset && (
            <img
              src={collection.featuredAsset.preview}
              alt={collection.name}
              className="w-6 h-6 rounded object-cover flex-shrink-0"
            />
          )}
          
          <span className="font-medium truncate flex-1">
            {collection.name}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {showProductCounts && (
            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
              {/* This would come from the GraphQL response with product count */}
              {Math.floor(Math.random() * 100) + 1}
            </span>
          )}
          
          {isSelected && (
            <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-4 border-l-2 border-neutral-100">
          {collection.children?.map((childCollection) => (
            <CategoryItem
              key={childCollection.id}
              collection={childCollection}
              allCollections={allCollections}
              selectedCollections={selectedCollections}
              onCollectionSelect={onCollectionSelect}
              showProductCounts={showProductCounts}
              level={level + 1}
              isExpanded={false}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Breadcrumbs({ 
  currentCollection, 
  onNavigate 
}: { 
  currentCollection?: Collection
  onNavigate: (slug: string) => void 
}) {
  if (!currentCollection?.breadcrumbs || currentCollection.breadcrumbs.length === 0) {
    return null
  }

  return (
    <div className="mb-4 p-3 bg-neutral-50 rounded-xl">
      <nav className="flex items-center space-x-2 text-sm">
        <button
          onClick={() => onNavigate('')}
          className="text-brand-600 hover:text-brand-700 font-medium"
        >
          All Products
        </button>
        
        {currentCollection.breadcrumbs.map((breadcrumb, index) => (
          <div key={breadcrumb.id} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <button
              onClick={() => onNavigate(breadcrumb.slug)}
              className={`${
                index === currentCollection.breadcrumbs!.length - 1
                  ? 'text-neutral-900 font-medium'
                  : 'text-brand-600 hover:text-brand-700'
              }`}
            >
              {breadcrumb.name}
            </button>
          </div>
        ))}
      </nav>
    </div>
  )
}

function RecentlyViewedCategories({ 
  recentCategories, 
  onNavigate 
}: { 
  recentCategories: Collection[]
  onNavigate: (slug: string) => void 
}) {
  if (recentCategories.length === 0) return null

  return (
    <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
      <h4 className="font-semibold text-neutral-900 mb-3">Recently Viewed</h4>
      <div className="space-y-2">
        {recentCategories.slice(0, 5).map((collection) => (
          <button
            key={collection.id}
            onClick={() => onNavigate(collection.slug)}
            className="flex items-center space-x-3 w-full text-left p-2 rounded-lg hover:bg-white transition-colors duration-200 group"
          >
            {collection.featuredAsset && (
              <img
                src={collection.featuredAsset.preview}
                alt={collection.name}
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <span className="text-sm text-neutral-700 group-hover:text-neutral-900 font-medium">
              {collection.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function PopularCategories({ 
  popularCategories, 
  onNavigate 
}: { 
  popularCategories: Collection[]
  onNavigate: (slug: string) => void 
}) {
  if (popularCategories.length === 0) return null

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-neutral-900 mb-3">Popular Categories</h4>
      <div className="grid grid-cols-2 gap-2">
        {popularCategories.slice(0, 6).map((collection) => (
          <button
            key={collection.id}
            onClick={() => onNavigate(collection.slug)}
            className="relative overflow-hidden rounded-xl aspect-square group"
          >
            {collection.featuredAsset ? (
              <img
                src={collection.featuredAsset.preview}
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300" />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-semibold text-sm text-center px-2">
                {collection.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function CategoryFilter({
  collections,
  selectedCollections = [],
  currentCollection,
  onCollectionSelect = () => {},
  showProductCounts = true,
  showBreadcrumbs = true,
  className = ""
}: CategoryFilterProps) {
  // Mock recent categories (in a real app, this would come from localStorage or user data)
  const recentCategories = collections.slice(0, 3)
  
  // Mock popular categories (in a real app, this would come from analytics)
  const popularCategories = collections.slice(3, 9)

  const handleNavigate = useCallback((slug: string) => {
    onCollectionSelect(slug)
  }, [onCollectionSelect])

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <Breadcrumbs
          currentCollection={currentCollection}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Category Tree */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Categories</h3>
          {selectedCollections.length > 0 && (
            <button
              onClick={() => onCollectionSelect('')}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear ({selectedCollections.length})
            </button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <CategoryTree
            collections={collections}
            selectedCollections={selectedCollections}
            onCollectionSelect={onCollectionSelect}
            showProductCounts={showProductCounts}
          />
        </div>
      </div>

      {/* Popular Categories */}
      <PopularCategories
        popularCategories={popularCategories}
        onNavigate={handleNavigate}
      />

      {/* Recently Viewed */}
      <RecentlyViewedCategories
        recentCategories={recentCategories}
        onNavigate={handleNavigate}
      />
    </div>
  )
}

// Simplified version for mobile or compact displays
export function CompactCategoryFilter({
  collections,
  selectedCollections = [],
  onCollectionSelect = () => {},
  className = ""
}: Pick<CategoryFilterProps, 'collections' | 'selectedCollections' | 'onCollectionSelect' | 'className'>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCollectionSelect('')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
            selectedCollections.length === 0
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:text-neutral-900'
          }`}
        >
          All
        </button>
        
        {collections.slice(0, 8).map((collection) => (
          <button
            key={collection.id}
            onClick={() => onCollectionSelect(collection.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 ${
              selectedCollections.includes(collection.slug)
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:text-neutral-900'
            }`}
          >
            {collection.name}
          </button>
        ))}
      </div>
    </div>
  )
}