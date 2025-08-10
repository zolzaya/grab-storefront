import { Link } from '@remix-run/react'
import { Product } from '~/lib/types'
import { useState, useCallback } from 'react'

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (productId: string) => void
  onRemoveFromWishlist?: (productId: string) => void
  isWishlisted?: boolean
  showQuickAdd?: boolean
  showWishlist?: boolean
  showVariants?: boolean
  showRating?: boolean
  showStock?: boolean
  className?: string
}

export function ProductCard({ 
  product,
  onQuickView,
  onAddToWishlist,
  onRemoveFromWishlist,
  isWishlisted: externalWishlisted = false,
  showQuickAdd = true,
  showWishlist = true,
  showVariants = true,
  showRating = true,
  showStock = true,
  className = ""
}: ProductCardProps) {
  const [internalWishlisted, setInternalWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Use external wishlist state if provided, otherwise internal
  const isWishlisted = externalWishlisted || internalWishlisted
  
  // Calculate pricing
  const price = product.variants[0]?.priceWithTax || 0
  const originalPrice = price * 1.2 // Simulate a sale price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price / 100)
  
  const formattedOriginalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(originalPrice / 100)

  // Use product data for sale info if available, otherwise simulate
  const isOnSale = product.onSale ?? (Math.random() > 0.7)
  const discountPercentage = product.discountPercentage ?? Math.round(((originalPrice - price) / originalPrice) * 100)

  // Stock status
  const stockLevel = product.variants[0]?.stockLevel || 'IN_STOCK'
  const isInStock = stockLevel === 'IN_STOCK'
  const isLowStock = stockLevel === 'LOW_STOCK'
  
  // Rating info
  const rating = product.reviewRating || (4 + Math.random())
  const reviewCount = product.reviewCount || Math.floor(Math.random() * 200) + 10
  
  // Available images for hover effect
  const images = product.assets?.length > 0 ? product.assets : (product.featuredAsset ? [product.featuredAsset] : [])

  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onAddToWishlist && onRemoveFromWishlist) {
      if (isWishlisted) {
        onRemoveFromWishlist(product.id)
      } else {
        onAddToWishlist(product.id)
      }
    } else {
      setInternalWishlisted(!internalWishlisted)
    }
  }, [isWishlisted, internalWishlisted, onAddToWishlist, onRemoveFromWishlist, product.id])

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onQuickView?.(product)
  }, [onQuickView, product])

  const handleImageHover = useCallback(() => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % Math.min(images.length, 3))
    }
  }, [images.length])

  const getStockDisplay = () => {
    if (!isInStock) return { text: 'Out of Stock', color: 'text-error-600', bg: 'bg-error-500' }
    if (isLowStock) return { text: 'Low Stock', color: 'text-warning-600', bg: 'bg-warning-500' }
    return { text: 'In Stock', color: 'text-success-600', bg: 'bg-success-500' }
  }

  const stockDisplay = getStockDisplay()

  return (
    <div 
      className={`group relative bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 animate-fade-in-up overflow-hidden transform hover:-translate-y-1 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Badges Container */}
        <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
          {/* Sale Badge */}
          {isOnSale && (
            <span className="bg-error-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-medium animate-bounce-soft">
              -{discountPercentage}%
            </span>
          )}
          
          {/* New Badge */}
          {product.enabled && (
            <span className="bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-medium">
              New
            </span>
          )}
          
          {/* Stock Badge */}
          {!isInStock && (
            <span className="bg-neutral-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-medium">
              Sold Out
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
          {/* Wishlist Button */}
          {showWishlist && (
            <button
              className={`p-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                isWishlisted 
                  ? 'bg-error-500 text-white shadow-medium scale-100' 
                  : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-error-500 hover:scale-110'
              } ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
              onClick={handleWishlistToggle}
              title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          
          {/* Quick View Button */}
          {onQuickView && (
            <button
              className={`p-2 rounded-full bg-white/90 backdrop-blur-sm text-neutral-600 hover:bg-white hover:text-brand-500 hover:scale-110 transition-all duration-200 ${
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }`}
              onClick={handleQuickView}
              title="Quick view"
              style={{ transitionDelay: '50ms' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
        </div>

        {/* Product Image */}
        <div 
          className="relative aspect-square overflow-hidden bg-neutral-100 rounded-t-2xl"
          onMouseEnter={handleImageHover}
        >
          {images.length > 0 ? (
            <img
              src={(images[currentImageIndex]?.preview || product.featuredAsset?.preview) + '?preset=medium'}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
              <div className="text-neutral-400 text-center">
                <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">No image</span>
              </div>
            </div>
          )}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Quick add button */}
          {showQuickAdd && isInStock && (
            <div className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <button 
                className="w-full bg-neutral-900 text-white py-3 px-4 text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors duration-200 shadow-large"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Handle quick add to cart
                }}
              >
                Quick Add to Cart
              </button>
            </div>
          )}
          
          {/* Out of stock overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center">
              <span className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-neutral-900 group-hover:text-brand-600 transition-colors duration-200 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-neutral-900">
              {formattedPrice}
            </span>
            {isOnSale && (
              <span className="text-sm text-neutral-500 line-through">
                {formattedOriginalPrice}
              </span>
            )}
            {isOnSale && (
              <span className="text-xs font-medium text-error-600 bg-error-50 px-2 py-1 rounded-full">
                Save {discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Reviews & Stock */}
          <div className="flex items-center justify-between">
            {showRating && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-neutral-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-neutral-500 font-medium">
                  ({rating.toFixed(1)}) {reviewCount}
                </span>
              </div>
            )}
            
            {/* Stock Status */}
            {showStock && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${stockDisplay.bg}`}></div>
                <span className={`text-xs font-medium ${stockDisplay.color}`}>
                  {stockDisplay.text}
                </span>
              </div>
            )}
          </div>
          
          {/* Product Collections/Categories */}
          {product.collections && product.collections.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.collections.slice(0, 2).map((collection) => (
                <span
                  key={collection.id}
                  className="inline-flex items-center px-2 py-1 text-xs text-neutral-600 bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors duration-200 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    // Navigate to collection
                  }}
                >
                  {collection.name}
                </span>
              ))}
              {product.collections.length > 2 && (
                <span className="text-xs text-neutral-500 font-medium">
                  +{product.collections.length - 2} more
                </span>
              )}
            </div>
          )}
          
          {/* Color Variants */}
          {showVariants && product.facetValues && product.facetValues.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <div className="flex space-x-1.5">
                {/* Mock color variants - in real app would filter facetValues by color facet */}
                {[
                  { color: 'bg-neutral-800', name: 'Black' },
                  { color: 'bg-brand-600', name: 'Blue' },
                  { color: 'bg-error-600', name: 'Red' },
                  { color: 'bg-success-600', name: 'Green' }
                ].slice(0, Math.min(3, product.variants.length)).map((variant, index) => (
                  <button 
                    key={index}
                    className={`w-5 h-5 rounded-full ${variant.color} border-2 border-white shadow-soft hover:scale-110 transition-transform duration-200`}
                    title={variant.name}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      // Handle variant selection
                    }}
                  />
                ))}
                {product.variants.length > 3 && (
                  <span className="text-xs text-neutral-500 font-medium ml-1">
                    +{product.variants.length - 3} more
                  </span>
                )}
              </div>
              
              {/* More Options Indicator */}
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-brand-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}