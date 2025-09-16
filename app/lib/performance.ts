import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Debounce hook for expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for frequent events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0)

  return useCallback((...args: Parameters<T>) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args)
      lastRan.current = Date.now()
    }
  }, [callback, delay]) as T
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, {
      threshold: 0.1,
      ...options
    })

    observer.observe(target)

    return () => {
      observer.unobserve(target)
    }
  }, [targetRef, options])

  return isIntersecting
}

// Memoized filter function for product filtering
export const createFilterMemo = () => {
  return useMemo(() => {
    const filterProducts = (
      products: any[],
      filters: {
        priceMin?: number
        priceMax?: number
        brands?: string[]
        productTypes?: string[]
        searchTerm?: string
      }
    ) => {
      return products.filter(product => {
        // Price filtering
        if (filters.priceMin && product.priceWithTax < filters.priceMin) return false
        if (filters.priceMax && product.priceWithTax > filters.priceMax) return false

        // Brand filtering
        if (filters.brands?.length && !filters.brands.includes(product.brandId)) return false

        // Product type filtering
        if (filters.productTypes?.length && !filters.productTypes.some(type =>
          product.facetValues?.some((fv: any) => fv.id === type)
        )) return false

        // Search term filtering
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase()
          if (!product.name.toLowerCase().includes(term) &&
              !product.description?.toLowerCase().includes(term)) return false
        }

        return true
      })
    }

    return filterProducts
  }, [])
}

// Performance measurement hook
export function usePerformanceMeasure(name: string) {
  const startTime = useRef<number>(0)

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    const duration = performance.now() - startTime.current
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${duration.toFixed(2)}ms`)
    }
    return duration
  }, [name])

  return { start, end }
}

// Optimized sort function
export const optimizedSort = useMemo(() => {
  const sortProducts = (products: any[], sortBy: string) => {
    // Create a shallow copy to avoid mutating original array
    const sorted = [...products]

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.priceWithTax - b.priceWithTax)
      case 'price-desc':
        return sorted.sort((a, b) => b.priceWithTax - a.priceWithTax)
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      default:
        return sorted
    }
  }

  return sortProducts
}, [])

// Virtual scrolling hook for large lists
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = useMemo(() => {
    return Math.floor(scrollTop / itemHeight)
  }, [scrollTop, itemHeight])

  const visibleEnd = useMemo(() => {
    return Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )
  }, [scrollTop, containerHeight, itemHeight, itemCount])

  const visibleItems = useMemo(() => {
    return Array.from(
      { length: visibleEnd - visibleStart + 1 },
      (_, index) => visibleStart + index
    )
  }, [visibleStart, visibleEnd])

  const totalHeight = itemCount * itemHeight
  const offsetY = visibleStart * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// Bundle size optimization - dynamic imports helper
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn)
}