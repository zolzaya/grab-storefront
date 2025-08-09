import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock environment variables
process.env.VENDURE_SHOP_API_URL = 'http://localhost:3000/shop-api'


// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})