import { vi } from 'vitest'

// Mock all Storefront UI components with simple implementations
export const SfButton = vi.fn(({ children, className, ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
))

export const SfIconShoppingCart = vi.fn(() => <span data-testid="shopping-cart-icon">🛒</span>)
export const SfIconPerson = vi.fn(() => <span data-testid="person-icon">👤</span>)

export const SfBadge = vi.fn(({ content, className }) => (
  <span className={className} data-testid="badge">
    {content}
  </span>
))

export const SfRating = vi.fn(({ value, max }) => (
  <div data-testid="rating" data-value={value} data-max={max}>
    {'★'.repeat(Math.floor(value))}{'☆'.repeat(max - Math.floor(value))}
  </div>
))