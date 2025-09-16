// Simple in-memory cache with TTL for GraphQL responses
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Create cache key from query and variables
  createKey(query: string, variables?: any): string {
    const variablesStr = variables ? JSON.stringify(variables) : ''
    return `${query.slice(0, 50)}:${variablesStr}`
  }
}

// Export singleton instance
export const queryCache = new QueryCache()

// Clean up expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup()
  }, 10 * 60 * 1000)
}

// Query optimization helpers
export function memoizeQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = queryCache.get<T>(key)
  if (cached) {
    return Promise.resolve(cached)
  }

  return queryFn().then(result => {
    queryCache.set(key, result, ttl)
    return result
  })
}

// Prefetch helper for common queries
export async function prefetchCommonData(request?: Request) {
  const commonQueries = [
    'collections',
    'facets',
    'popular-products'
  ]

  // Only prefetch on server-side to avoid unnecessary client requests
  if (typeof window === 'undefined') {
    // Implementation would go here for prefetching common data
    // This is a placeholder for the concept
  }
}

// Performance monitoring
export interface PerformanceMetrics {
  queryTime: number
  cacheHit: boolean
  querySize: number
}

export function trackQueryPerformance(
  queryName: string,
  startTime: number,
  cacheHit: boolean,
  dataSize?: number
): PerformanceMetrics {
  const metrics: PerformanceMetrics = {
    queryTime: Date.now() - startTime,
    cacheHit,
    querySize: dataSize || 0
  }

  // In development, log slow queries
  if (process.env.NODE_ENV === 'development' && metrics.queryTime > 1000) {
    console.warn(`Slow query detected: ${queryName} took ${metrics.queryTime}ms`)
  }

  return metrics
}