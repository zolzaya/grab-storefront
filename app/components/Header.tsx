import { Link } from '@remix-run/react'
import { Order } from '~/lib/types'

interface HeaderProps {
  activeOrder?: Order | null
}

export function Header({ activeOrder }: HeaderProps) {
  const cartItemsCount = activeOrder?.totalQuantity || 0

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Your Store
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/products" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Products
            </Link>
            <Link 
              to="/collections" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Collections
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              👤
            </button>
            
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              🛒
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}