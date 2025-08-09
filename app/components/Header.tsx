import { Link } from '@remix-run/react'
import { Order } from '~/lib/types'
import { useState, useEffect } from 'react'

interface HeaderProps {
  activeOrder?: Order | null
}

export function Header({ activeOrder }: HeaderProps) {
  const cartItemsCount = activeOrder?.totalQuantity || 0
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-soft border-b border-neutral-200/50' : 'border-b border-neutral-200'
      }`}>
        {/* Announcement Bar */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white text-center py-3">
          <p className="text-sm font-medium tracking-wide">
            ✨ Free shipping on orders over $75 • 30-day returns • 24/7 support
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                className="p-2 rounded-xl hover:bg-neutral-100 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold text-neutral-900 tracking-tight hover:text-brand-600 transition-colors duration-200"
              >
                VENDURE
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link 
                to="/products" 
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                Catalog
              </Link>
              <Link 
                to="/collections" 
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                Collections
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                About
              </Link>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <button 
                className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Account */}
              <button className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v0a2 2 0 00-2 2v0M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce-soft">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsMobileMenuOpen(false)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close mobile menu"
          />
          <div className="absolute top-0 left-0 w-80 max-w-sm h-full bg-white shadow-large animate-slide-in-right">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <span className="text-lg font-bold text-neutral-900">Menu</span>
              <button 
                className="p-2 rounded-xl hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-6 space-y-4">
              <Link 
                to="/products" 
                className="block px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalog
              </Link>
              <Link 
                to="/collections" 
                className="block px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Collections
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all duration-200 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <Link 
                  to="/cart" 
                  className="flex items-center px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v0a2 2 0 00-2 2v0M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  Shopping Cart
                  {cartItemsCount > 0 && (
                    <span className="ml-auto bg-brand-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Search Products</h2>
              <button 
                className="p-2 rounded-xl hover:bg-neutral-100"
                onClick={() => setIsSearchOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form action="/products" method="GET" className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="What are you looking for?"
                  className="w-full px-6 py-4 text-lg border-2 border-neutral-300 rounded-2xl focus:border-brand-500 focus:outline-none transition-colors duration-200"
                />
                <button 
                  type="submit" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
            <div className="text-center text-neutral-500">
              <p>Popular searches: Electronics, Clothing, Home & Garden</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}