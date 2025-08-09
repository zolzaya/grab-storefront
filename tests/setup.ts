import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock environment variables
process.env.VENDURE_SHOP_API_URL = 'http://localhost:3000/shop-api'

// Mock Storefront UI components globally
vi.mock('@storefront-ui/react', async () => {
  const mocks = await import('./__mocks__/storefront-ui')
  return mocks
})

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})