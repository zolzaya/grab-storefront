import { vi } from 'vitest'
import { ProductList } from '~/lib/types'

// Mock GraphQL responses
export const mockProductsResponse: { products: ProductList } = {
  products: {
    items: [
      {
        id: '1',
        name: 'Test Product 1',
        slug: 'test-product-1',
        description: 'A great test product',
        featuredAsset: {
          id: '1',
          preview: 'https://example.com/image1.jpg',
        },
        variants: [
          {
            id: '1',
            name: 'Default',
            sku: 'TEST-001',
            price: 2000,
            priceWithTax: 2000,
            stockLevel: 'IN_STOCK',
          },
        ],
      },
      {
        id: '2',
        name: 'Test Product 2',
        slug: 'test-product-2',
        description: 'Another test product',
        featuredAsset: {
          id: '2',
          preview: 'https://example.com/image2.jpg',
        },
        variants: [
          {
            id: '2',
            name: 'Default',
            sku: 'TEST-002',
            price: 3000,
            priceWithTax: 3000,
            stockLevel: 'IN_STOCK',
          },
        ],
      },
    ],
    totalItems: 2,
  },
}

export const mockEmptyProductsResponse: { products: ProductList } = {
  products: {
    items: [],
    totalItems: 0,
  },
}

// Mock the GraphQL request function
export const mockShopApiRequest = vi.fn()

// Export mock implementations
export { mockShopApiRequest as shopApiRequest }