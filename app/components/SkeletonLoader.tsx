import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Badge Skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="w-12 h-5 rounded-full" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-4 h-4 rounded" />
            ))}
          </div>
          <Skeleton className="w-12 h-3" />
        </div>

        {/* Price Skeleton */}
        <div className="space-y-1">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-5" />
        </div>

        {/* Stock Status Skeleton */}
        <Skeleton className="w-24 h-4" />

        {/* Timer Skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-32 h-3" />
        </div>
      </div>
    </div>
  )
}

export function FilterSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter Title */}
      <Skeleton className="w-24 h-5" />

      {/* Filter Options */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="flex-1 h-4" />
            <Skeleton className="w-8 h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PriceSliderSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="w-20 h-5" />

      {/* Slider Track */}
      <div className="space-y-3">
        <Skeleton className="w-full h-2 rounded-full" />

        {/* Input Fields */}
        <div className="flex space-x-2">
          <Skeleton className="flex-1 h-10 rounded" />
          <Skeleton className="flex-1 h-10 rounded" />
        </div>
      </div>
    </div>
  )
}

export function CategorySidebarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="w-32 h-5" />

      {/* Categories */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-24 h-4" />
              </div>
              <Skeleton className="w-8 h-3" />
            </div>

            {/* Subcategories */}
            {i < 3 && (
              <div className="ml-6 space-y-2">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="w-20 h-3" />
                    <Skeleton className="w-6 h-3" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function BrandFilterSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Skeleton className="w-16 h-5" />

      {/* Brand Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2 p-3 border border-gray-200 rounded">
            <Skeleton className="w-6 h-6 rounded" />
            <div className="flex-1">
              <Skeleton className="w-full h-3" />
              <Skeleton className="w-8 h-2 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaginationSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Results Summary Skeleton */}
      <Skeleton className="w-48 h-4" />

      {/* Pagination Controls Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="w-16 h-10 rounded-md" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="w-10 h-10 rounded-md" />
        ))}
        <Skeleton className="w-16 h-10 rounded-md" />
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Title and Count */}
        <div className="space-y-2">
          <Skeleton className="w-48 h-7" />
          <Skeleton className="w-32 h-4" />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Buttons */}
          <div className="flex space-x-2">
            <Skeleton className="w-10 h-10 rounded" />
            <Skeleton className="w-10 h-10 rounded" />
          </div>

          {/* Sort Dropdown */}
          <Skeleton className="w-48 h-10 rounded" />
        </div>
      </div>
    </div>
  )
}