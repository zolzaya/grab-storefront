import { test, expect, vi } from 'vitest'
import { loader } from '~/routes/products._index'
import { shopApiRequest } from '~/lib/graphql'

// Mock the GraphQL client
vi.mock('~/lib/graphql')

const mockProducts = {
  items: [
    {
      id: '1',
      name: 'Product A',
      slug: 'product-a',
      description: 'First product',
      variants: [{ id: '1', name: 'Default', price: 1000, priceWithTax: 1200, sku: 'PA-001', stockLevel: '10' }],
      featuredAsset: { id: '1', preview: '/test-image.jpg' }
    },
    {
      id: '2', 
      name: 'Product B',
      slug: 'product-b',
      description: 'Second product',
      variants: [{ id: '2', name: 'Default', price: 2000, priceWithTax: 2400, sku: 'PB-001', stockLevel: '5' }],
      featuredAsset: { id: '2', preview: '/test-image2.jpg' }
    },
    {
      id: '3',
      name: 'Product C', 
      slug: 'product-c',
      description: 'Third product',
      variants: [{ id: '3', name: 'Default', price: 500, priceWithTax: 600, sku: 'PC-001', stockLevel: '15' }],
      featuredAsset: { id: '3', preview: '/test-image3.jpg' }
    }
  ],
  totalItems: 3
}

const mockShopApiRequest = vi.mocked(shopApiRequest)

test('loader handles sort parameters correctly', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  // Test price-low sorting
  const request = new Request('http://localhost/products?sort=price-low')
  const result = await loader({ request, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0,
        sort: { price: 'ASC' }
      }
    }
  )
  
  expect(result.sort).toBe('price-low')
})

test('loader handles different sort options', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  // Test name sorting ascending
  const request1 = new Request('http://localhost/products?sort=name-asc')
  await loader({ request: request1, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0,
        sort: { name: 'ASC' }
      }
    }
  )

  // Test price sorting descending
  const request2 = new Request('http://localhost/products?sort=price-high')
  await loader({ request: request2, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0,
        sort: { price: 'DESC' }
      }
    }
  )

  // Test newest first
  const request3 = new Request('http://localhost/products?sort=newest')
  await loader({ request: request3, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0,
        sort: { createdAt: 'DESC' }
      }
    }
  )
})

test('loader handles relevance (no sort)', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  const request = new Request('http://localhost/products?sort=relevance')
  await loader({ request, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0
      }
    }
  )
})

test('sort combines with search parameters', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  const request = new Request('http://localhost/products?search=test&sort=price-low')
  await loader({ request, context: {}, params: {} })
  
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0,
        sort: { price: 'ASC' },
        filter: {
          name: {
            contains: 'test'
          }
        }
      }
    }
  )
})

test('loader handles invalid sort parameter gracefully', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  const request = new Request('http://localhost/products?sort=invalid-sort')
  const result = await loader({ request, context: {}, params: {} })
  
  // Should fall back to no sorting (relevance)
  expect(mockShopApiRequest).toHaveBeenCalledWith(
    expect.any(String),
    {
      options: {
        take: 12,
        skip: 0
      }
    }
  )
  
  expect(result.sort).toBe('invalid-sort') // Should preserve the URL param even if invalid
})

test('loader correctly maps all sort parameters', async () => {
  mockShopApiRequest.mockResolvedValue({ products: mockProducts })

  // Test all sort parameter mappings
  const sortTests = [
    { param: 'name-asc', expected: { name: 'ASC' } },
    { param: 'name-desc', expected: { name: 'DESC' } },
    { param: 'price-low', expected: { price: 'ASC' } },
    { param: 'price-high', expected: { price: 'DESC' } },
    { param: 'newest', expected: { createdAt: 'DESC' } },
    { param: 'oldest', expected: { createdAt: 'ASC' } }
  ]

  for (const { param, expected } of sortTests) {
    mockShopApiRequest.mockClear()
    
    const request = new Request(`http://localhost/products?sort=${param}`)
    const result = await loader({ request, context: {}, params: {} })
    
    expect(mockShopApiRequest).toHaveBeenCalledWith(
      expect.any(String),
      {
        options: {
          take: 12,
          skip: 0,
          sort: expected
        }
      }
    )
    
    expect(result.sort).toBe(param)
  }
})