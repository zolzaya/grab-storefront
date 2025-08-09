import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockProductsResponse, mockEmptyProductsResponse, mockShopApiRequest } from '../__mocks__/graphql'

// Mock the graphql module
vi.mock('~/lib/graphql', () => ({
  shopApiRequest: mockShopApiRequest,
}))

// Mock useLoaderData
const mockUseLoaderData = vi.fn()
vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual('@remix-run/react')
  return {
    ...actual,
    useLoaderData: mockUseLoaderData,
  }
})

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

// Import component after mocks are set up
const { default: Index, loader } = await import('~/routes/_index')

describe('Index Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component', () => {
    it('renders hero section', () => {
      mockUseLoaderData.mockReturnValue(mockProductsResponse)
      
      renderWithRouter(<Index />)
      
      expect(screen.getByText('Welcome to Your Store')).toBeInTheDocument()
      expect(screen.getByText('Discover amazing products with unbeatable prices')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /shop now/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /browse collections/i })).toBeInTheDocument()
    })

    it('renders featured products section with products', () => {
      mockUseLoaderData.mockReturnValue(mockProductsResponse)
      
      renderWithRouter(<Index />)
      
      expect(screen.getByText('Featured Products')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /view all products/i })).toBeInTheDocument()
    })

    it('renders empty state when no products', () => {
      mockUseLoaderData.mockReturnValue(mockEmptyProductsResponse)
      
      renderWithRouter(<Index />)
      
      expect(screen.getByText('No products found')).toBeInTheDocument()
      expect(screen.getByText('Make sure your Vendure backend is running and has products')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /view all products/i })).not.toBeInTheDocument()
    })

    it('renders features section', () => {
      mockUseLoaderData.mockReturnValue(mockProductsResponse)
      
      renderWithRouter(<Index />)
      
      expect(screen.getByText('Why Choose Us?')).toBeInTheDocument()
      expect(screen.getByText('Fast Delivery')).toBeInTheDocument()
      expect(screen.getByText('Quality Products')).toBeInTheDocument()
      expect(screen.getByText('Great Support')).toBeInTheDocument()
    })

    it('has correct navigation links', () => {
      mockUseLoaderData.mockReturnValue(mockProductsResponse)
      
      renderWithRouter(<Index />)
      
      const shopNowLink = screen.getByRole('link', { name: /shop now/i })
      expect(shopNowLink).toHaveAttribute('href', '/products')
      
      const collectionsLink = screen.getByRole('link', { name: /browse collections/i })
      expect(collectionsLink).toHaveAttribute('href', '/collections')
    })
  })

  describe('Loader', () => {
    it('loads products successfully', async () => {
      mockShopApiRequest.mockResolvedValue(mockProductsResponse)
      
      const request = new Request('http://localhost:3000/')
      const result = await loader({ request, context: {}, params: {} })
      
      expect(result).toEqual(mockProductsResponse)
      expect(mockShopApiRequest).toHaveBeenCalledWith(
        expect.any(String), // GET_PRODUCTS query
        { options: { take: 8 } }
      )
    })

    it('handles GraphQL errors gracefully', async () => {
      mockShopApiRequest.mockRejectedValue(new Error('GraphQL error'))
      
      const request = new Request('http://localhost:3000/')
      const result = await loader({ request, context: {}, params: {} })
      
      expect(result).toEqual({
        products: { items: [], totalItems: 0 }
      })
    })
  })
})