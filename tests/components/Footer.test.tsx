import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Footer } from '~/components/Footer'

function renderWithRouter(ui: React.ReactElement) {
  return render(ui, { wrapper: BrowserRouter })
}

describe('Footer', () => {
  it('renders store name and description', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('Your Store')).toBeInTheDocument()
    expect(screen.getByText('Your one-stop shop for quality products. Built with Vendure and Storefront UI.')).toBeInTheDocument()
  })

  it('renders shop section links', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All Products' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Collections' })).toBeInTheDocument()
  })

  it('renders support section links', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('Support')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Help Center' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    renderWithRouter(<Footer />)
    expect(screen.getByText('© 2024 Your Store. All rights reserved.')).toBeInTheDocument()
  })

  it('has correct link URLs', () => {
    renderWithRouter(<Footer />)
    
    expect(screen.getByRole('link', { name: 'All Products' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'Collections' })).toHaveAttribute('href', '/collections')
    expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help')
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact')
  })

  it('has proper semantic structure', () => {
    renderWithRouter(<Footer />)
    
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('bg-gray-900', 'text-white')
  })
})