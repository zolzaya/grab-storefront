import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Header } from '~/components/Header'
import { Order } from '~/lib/types'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

describe('Header', () => {
  it('renders store name', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Your Store')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Collections')).toBeInTheDocument()
  })

  it('renders cart link without badge when no active order', () => {
    renderWithRouter(<Header />)
    expect(screen.getByRole('link', { name: '🛒' })).toBeInTheDocument()
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it('displays cart badge with item count when there is an active order', () => {
    const mockOrder: Partial<Order> = {
      totalQuantity: 3
    }
    
    renderWithRouter(<Header activeOrder={mockOrder as Order} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not display cart badge when order has 0 items', () => {
    const mockOrder: Partial<Order> = {
      totalQuantity: 0
    }
    
    renderWithRouter(<Header activeOrder={mockOrder as Order} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('has correct links', () => {
    renderWithRouter(<Header />)
    
    const storeLink = screen.getByRole('link', { name: 'Your Store' })
    expect(storeLink).toHaveAttribute('href', '/')
    
    const productsLink = screen.getByRole('link', { name: 'Products' })
    expect(productsLink).toHaveAttribute('href', '/products')
    
    const collectionsLink = screen.getByRole('link', { name: 'Collections' })
    expect(collectionsLink).toHaveAttribute('href', '/collections')
    
    const cartLink = screen.getByRole('link', { name: '🛒' })
    expect(cartLink).toHaveAttribute('href', '/cart')
  })
})