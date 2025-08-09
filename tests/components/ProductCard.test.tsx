import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { ProductCard } from '~/components/ProductCard'
import { Product } from '~/lib/types'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'This is a test product description',
  featuredAsset: {
    id: '1',
    preview: 'https://example.com/image.jpg',
    source: 'https://example.com/image-full.jpg',
  },
  variants: [
    {
      id: '1',
      name: 'Default',
      sku: 'TEST-001',
      price: 2500,
      priceWithTax: 2500, // $25.00
      stockLevel: 'IN_STOCK',
      featuredAsset: undefined,
    },
  ],
}

const mockProductWithoutImage: Product = {
  ...mockProduct,
  featuredAsset: undefined,
}

describe('ProductCard', () => {
  it('renders product name', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product description', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('This is a test product description')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('$25.00')).toBeInTheDocument()
  })

  it('renders product image when featuredAsset exists', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg?preset=medium')
  })

  it('renders placeholder when no featuredAsset', () => {
    renderWithRouter(<ProductCard product={mockProductWithoutImage} />)
    expect(screen.getByText('No image')).toBeInTheDocument()
    expect(screen.queryByAltText('Test Product')).not.toBeInTheDocument()
  })

  it('renders rating component', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('(4.5)')).toBeInTheDocument()
  })

  it('renders view details button', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('links to correct product page', () => {
    renderWithRouter(<ProductCard product={mockProduct} />)
    const productLink = screen.getByRole('link')
    expect(productLink).toHaveAttribute('href', '/products/test-product')
  })

  it('handles zero price', () => {
    const freeProduct: Product = {
      ...mockProduct,
      variants: [
        {
          ...mockProduct.variants[0],
          priceWithTax: 0,
        },
      ],
    }
    
    renderWithRouter(<ProductCard product={freeProduct} />)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('handles product with no variants', () => {
    const noVariantsProduct: Product = {
      ...mockProduct,
      variants: [],
    }
    
    renderWithRouter(<ProductCard product={noVariantsProduct} />)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
})