import { GraphQLClient } from 'graphql-request'

const VENDURE_SHOP_API_URL = process.env.VENDURE_SHOP_API_URL || 'http://localhost:3000/shop-api'

export const graphQLClient = new GraphQLClient(VENDURE_SHOP_API_URL, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const shopApiRequest = async <T>(query: string, variables?: any): Promise<T> => {
  try {
    const data = await graphQLClient.request<T>(query, variables)
    return data
  } catch (error) {
    console.error('GraphQL request error:', error)
    throw error
  }
}