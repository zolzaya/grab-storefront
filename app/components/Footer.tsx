import { Link } from '@remix-run/react'
import { useState } from 'react'

export function Footer() {
  const [email, setEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log('Newsletter signup:', email)
    setEmail('')
    // Could show success message here
  }

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-16 border-b border-neutral-700">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay in the loop
            </h2>
            <p className="text-xl text-neutral-300 mb-8">
              Get exclusive offers, new product updates, and styling tips delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-large hover:shadow-xl"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-sm text-neutral-400 mt-3">
                By subscribing, you agree to our privacy policy and terms of service.
              </p>
            </form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-center mb-6">
                <span className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  VENDURE
                </span>
              </Link>
              <p className="text-neutral-300 mb-6 max-w-md">
                Premium products that blend style with functionality. We&apos;re committed to quality, sustainability, and exceptional customer experience.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <a href="https://twitter.com" className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-brand-600 hover:scale-110 transition-all duration-200" aria-label="Follow us on Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="https://instagram.com" className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-brand-600 hover:scale-110 transition-all duration-200" aria-label="Follow us on Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://linkedin.com" className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-brand-600 hover:scale-110 transition-all duration-200" aria-label="Follow us on LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl text-white hover:bg-brand-600 hover:scale-110 transition-all duration-200" aria-label="Follow us on Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Shop</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/products" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link to="/new-arrivals" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/sale" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Sale Items
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/help" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Returns & Exchanges
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/about" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Press & Media
                  </Link>
                </li>
                <li>
                  <Link to="/sustainability" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/privacy" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/accessibility" className="text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-neutral-700 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <p className="text-neutral-400 text-center sm:text-left">
                © 2024 Vendure Store. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                  <span className="text-sm text-neutral-400">Service Status: All systems operational</span>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-400">We accept:</span>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-6 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">VISA</span>
                </div>
                <div className="w-10 h-6 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">MC</span>
                </div>
                <div className="w-10 h-6 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AMEX</span>
                </div>
                <div className="w-10 h-6 bg-white/10 backdrop-blur-sm rounded border border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}