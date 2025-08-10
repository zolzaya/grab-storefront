import { GraphQLClient } from 'graphql-request'

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
  request?: Request
): Promise<T> => {
  try {
    const client = request ? createGraphQLClient(request) : graphQLClient
    
    // Log request details for debugging
    if (typeof window === 'undefined') {
      console.log('Server-side GraphQL request:', {
        hasRequest: !!request,
        cookies: request?.headers.get('cookie') ? 'present' : 'none',
        url: VENDURE_SHOP_API_URL
      })
    }
    
    const data = await client.request<T>(query, variables)
    return data
  } catch (error) {
    console.error('GraphQL request error:', {
      error,
      url: VENDURE_SHOP_API_URL,
      variables,
      hasRequest: !!request
    })
    throw error
  }
}