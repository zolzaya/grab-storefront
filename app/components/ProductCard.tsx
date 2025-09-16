import { Link } from '@remix-run/react'
import { Product } from '~/lib/types'
import React, { useState, useCallback } from 'react'
import type { ViewMode } from './PageHeader'

interface ProductCardProps {
  product: Product & {
    originalPrice?: number
    discountPercent?: number
    installmentPrice?: number
    bonusAmount?: number
    stockStatus?: string
    daysLeft?: number
    rating?: number
    reviewCount?: number
  }
  viewMode?: ViewMode
}

function OptimizedImage({
  src,
  alt,
  className,
  fallback
}: {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Reset states when src changes
  React.useEffect(() => {
    if (currentSrc !== src) {
      console.log('Source changed from', currentSrc, 'to', src)
      setIsLoaded(false)
      setHasError(false)
      setCurrentSrc(src)
    }
  }, [src, currentSrc])

  const handleLoad = useCallback(() => {
    console.log('Image loaded successfully:', src, 'Setting isLoaded to true')
    setIsLoaded(true)
  }, [src])

  const handleError = useCallback(() => {
    console.log('Image failed to load:', src)
    setHasError(true)
    setIsLoaded(true)
  }, [src])

  if (hasError) {
    return fallback || (
      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">No image</span>
        </div>
      </div>
    )
  }

  console.log('OptimizedImage render:', { src, isLoaded, hasError })

  return (
    <div className="relative h-full w-full">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-blue-200 animate-pulse z-10" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 relative z-20`}
        style={{ opacity: isLoaded ? 1 : 0 }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  // Get the best available image - try product featuredAsset first, then variant featuredAsset
  const getProductImage = () => {
    if (product.featuredAsset?.preview) {
      return product.featuredAsset.preview
    }
    if (product.variants?.[0]?.featuredAsset?.preview) {
      return product.variants[0].featuredAsset.preview
    }
    // Temporary fallback for testing - show placeholder for products without images
    return 'https://via.placeholder.com/300x300/e2e8f0/64748b?text=' + encodeURIComponent(product.name || 'Product')
  }

  const imageUrl = getProductImage()


  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const price = product.variants[0]?.priceWithTax || 0
  const originalPrice = product.originalPrice || price * 1.3
  const discountPercent = product.discountPercent || Math.floor(Math.random() * 40) + 10
  const isOnSale = discountPercent > 0

  // Format price in Mongolian Tugrik
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + '₮'
  }

  const formattedPrice = formatPrice(price)
  const formattedOriginalPrice = formatPrice(originalPrice)

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {imageUrl ? (
              <OptimizedImage
                src={imageUrl.startsWith('https://via.placeholder.com') ? imageUrl : imageUrl + '?preset=medium'}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-red-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
            {isOnSale && (
              <div className="absolute -top-2 -right-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discountPercent}%
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Link to={`/products/${product.slug}`} className="block">
              <h3 className="font-medium text-gray-900 truncate hover:text-blue-600">
                {product.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
                {isOnSale && (
                  <span className="text-sm text-gray-500 line-through">{formattedOriginalPrice}</span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <span>В наличии</span>
                <div className="flex items-center gap-1">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(product.rating || 4)}
                    {'☆'.repeat(5 - (product.rating || 4))}
                  </div>
                  <span>({product.reviewCount || 0})</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Discount Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Countdown Timer */}
        {product.daysLeft && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-md">
              Хямдрал дуусах {product.daysLeft} өдөр
            </div>
          </div>
        )}

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-red-100">
          {imageUrl ? (
            <OptimizedImage
              src={imageUrl.startsWith('https://via.placeholder.com') ? imageUrl : imageUrl + '?preset=medium'}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">No image</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Stock Status Badge */}
          {product.stockStatus && (
            <div className="flex justify-center">
              <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                {product.stockStatus}
              </span>
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating */}
          {(product.rating || product.reviewCount) && (
            <div className="flex items-center justify-center gap-1">
              <div className="flex text-yellow-400 text-sm">
                {'★'.repeat(product.rating || 4)}
                {'☆'.repeat(5 - (product.rating || 4))}
              </div>
              <span className="text-xs text-gray-500">({product.reviewCount || 0} сэтгэгдэл)</span>
            </div>
          )}


          {/* Original Price (crossed out) */}
          {isOnSale && (
            <div className="text-center">
              <span className="text-sm text-gray-500 line-through">
                {formattedOriginalPrice}
              </span>
            </div>
          )}

          {/* Current Price */}
          <div className="text-center">
            <span className="text-xl font-bold text-gray-900">
              {formattedPrice}
            </span>
          </div>

          {/* Add to Cart Button */}
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault()
              // Add to cart logic here
            }}
          >
            Сагсанд нэмэх
          </button>
        </div>
      </Link>
    </div>
  )
}

// Keep the named export for backward compatibility
export { ProductCard }