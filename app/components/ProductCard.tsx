import { Link } from '@remix-run/react'
import { Product } from '~/lib/types'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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

  const isOnSale = Math.random() > 0.7 // 30% chance of being on sale
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100)

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in-up overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-error-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-error-500 text-white shadow-medium' 
              : 'bg-white/90 backdrop-blur-sm text-neutral-600 hover:bg-white hover:text-error-500'
          } ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted(!isWishlisted)
          }}
        >
          <svg className="w-4 h-4" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-t-2xl">
          {product.featuredAsset ? (
            <img
              src={product.featuredAsset.preview + '?preset=medium'}
              alt={product.name}
              className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
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
          
          {/* Quick add button - appears on hover */}
          <div className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button className="w-full bg-neutral-900 text-white py-3 px-4 text-sm font-semibold rounded-xl hover:bg-neutral-800 transition-colors duration-200 shadow-large">
              Quick Add
            </button>
          </div>
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
          </div>
          
          {/* Reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3.5 w-3.5 ${i < 4 ? 'text-warning-400' : 'text-neutral-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-neutral-500 font-medium">(4.0)</span>
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-success-500"></div>
              <span className="text-xs text-success-600 font-medium">In Stock</span>
            </div>
          </div>
          
          {/* Color Variants */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex space-x-1.5">
              {[
                { color: 'bg-neutral-800', name: 'Black' },
                { color: 'bg-brand-600', name: 'Blue' },
                { color: 'bg-error-600', name: 'Red' },
                { color: 'bg-success-600', name: 'Green' }
              ].slice(0, 3).map((variant, index) => (
                <button 
                  key={index}
                  className={`w-5 h-5 rounded-full ${variant.color} border-2 border-white shadow-soft hover:scale-110 transition-transform duration-200`}
                  title={variant.name}
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
        </div>
      </Link>
    </div>
  )
}