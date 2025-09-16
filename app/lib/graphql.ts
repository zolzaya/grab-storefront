import { GraphQLClient } from 'graphql-request'
import { queryCache, memoizeQuery, trackQueryPerformance } from './cache'

const VENDURE_SHOP_API_URL = process.env.VENDURE_SHOP_API_URL || 'http://localhost:4000/shop-api'

// Create a client factory to handle both server-side and client-side requests
export const createGraphQLClient = (request?: Request) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Forward cookies from the incoming request for server-side requests
  if (request && typeof window === 'undefined') {
    const cookie = request.headers.get('cookie')
    if (cookie) {
      headers.cookie = cookie
    }
  }
  
  return new GraphQLClient(VENDURE_SHOP_API_URL, {
    credentials: 'include',
    headers,
  })
}

// Default client for client-side requests
export const graphQLClient = createGraphQLClient()

export const shopApiRequest = async <T>(
  query: string,
  variables?: any,
  request?: Request,
  options?: {
    cache?: boolean
    cacheTTL?: number
    skipCache?: boolean
  }
): Promise<T> => {
  const startTime = Date.now()
  const cacheKey = queryCache.createKey(query, variables)
  const { cache = true, cacheTTL, skipCache = false } = options || {}

  try {
    // Check cache first (only for cacheable queries)
    if (cache && !skipCache && typeof window !== 'undefined') {
      const cached = queryCache.get<T>(cacheKey)
      if (cached) {
        trackQueryPerformance('cached-query', startTime, true, JSON.stringify(cached).length)
        return cached
      }
    }

    const client = request ? createGraphQLClient(request) : graphQLClient

    // Log request details for debugging
    if (typeof window === 'undefined') {
      console.log('Server-side GraphQL request:', {
        hasRequest: !!request,
        cookies: request?.headers.get('cookie') ? 'present' : 'none',
        url: VENDURE_SHOP_API_URL,
        cached: false
      })
    }

    const data = await client.request<T>(query, variables)

    // Cache the result (only on client-side for non-sensitive data)
    if (cache && typeof window !== 'undefined' && !query.includes('password') && !query.includes('login')) {
      queryCache.set(cacheKey, data, cacheTTL)
    }

    const dataSize = JSON.stringify(data).length
    trackQueryPerformance('graphql-query', startTime, false, dataSize)

    return data
  } catch (error) {
    trackQueryPerformance('graphql-error', startTime, false, 0)
    console.error('GraphQL request error:', {
      error,
      url: VENDURE_SHOP_API_URL,
      variables,
      hasRequest: !!request,
      cacheKey
    })
    throw error
  }
}

// Convenience function for cacheable queries
export const shopApiRequestCached = async <T>(
  query: string,
  variables?: any,
  request?: Request,
  cacheTTL = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  return shopApiRequest<T>(query, variables, request, { cache: true, cacheTTL })
}

// Convenience function for fresh queries (skip cache)
export const shopApiRequestFresh = async <T>(
  query: string,
  variables?: any,
  request?: Request
): Promise<T> => {
  return shopApiRequest<T>(query, variables, request, { skipCache: true })
}