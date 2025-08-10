import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Form, useNavigation } from "@remix-run/react"
import type { Product, Collection } from "~/lib/types"
import { POPULAR_SEARCHES } from "~/lib/constants"

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
  onSearch?: (query: string) => void
  onClear?: () => void
  suggestions?: SearchSuggestion[]
  isLoading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showPopularSearches?: boolean
  showHistory?: boolean
}

interface SearchSuggestion {
  type: 'product' | 'collection' | 'query'
  id: string
  title: string
  subtitle?: string
  image?: string
  url?: string
  count?: number
}

interface SearchDropdownProps {
  isOpen: boolean
  query: string
  suggestions: SearchSuggestion[]
  searchHistory: string[]
  popularSearches: string[]
  onSelectSuggestion: (suggestion: SearchSuggestion) => void
  onSelectHistory: (query: string) => void
  onSelectPopular: (query: string) => void
  onClearHistory: () => void
  isLoading?: boolean
}

function SearchDropdown({
  isOpen,
  query,
  suggestions,
  searchHistory,
  popularSearches,
  onSelectSuggestion,
  onSelectHistory,
  onSelectPopular,
  onClearHistory,
  isLoading
}: SearchDropdownProps) {
  if (!isOpen) return null

  const hasQuery = query.trim().length > 0
  const filteredHistory = searchHistory.filter(h => 
    h.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-large z-50 overflow-hidden animate-fade-in">
      {/* Loading State */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="inline-flex items-center space-x-2 text-neutral-600">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Searching...</span>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && hasQuery && suggestions.length > 0 && (
        <div className="border-b border-neutral-100">
          <div className="px-4 py-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Suggestions
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-neutral-50 transition-colors duration-200 text-left"
              >
                {suggestion.image ? (
                  <img
                    src={suggestion.image}
                    alt={suggestion.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {suggestion.type === 'product' ? (
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                      </svg>
                    ) : suggestion.type === 'collection' ? (
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">
                    {suggestion.title}
                  </p>
                  {suggestion.subtitle && (
                    <p className="text-sm text-neutral-600 truncate">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
                
                {suggestion.count && (
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full flex-shrink-0">
                    {suggestion.count}
                  </span>
                )}
                
                <div className="flex-shrink-0">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {!hasQuery && filteredHistory.length > 0 && (
        <div className="border-b border-neutral-100">
          <div className="flex items-center justify-between px-4 py-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Recent Searches
            </h4>
            <button
              onClick={onClearHistory}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear
            </button>
          </div>
          <div>
            {filteredHistory.map((historyQuery, index) => (
              <button
                key={index}
                onClick={() => onSelectHistory(historyQuery)}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-neutral-50 transition-colors duration-200 text-left group"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900 flex-1">
                  {historyQuery}
                </span>
                <svg className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {!hasQuery && popularSearches.length > 0 && (
        <div>
          <div className="px-4 py-2">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Popular Searches
            </h4>
          </div>
          <div className="pb-2">
            {popularSearches.slice(0, 6).map((popular, index) => (
              <button
                key={index}
                onClick={() => onSelectPopular(popular)}
                className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-neutral-50 transition-colors duration-200 text-left group"
              >
                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900 flex-1">
                  {popular}
                </span>
                <svg className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && hasQuery && suggestions.length === 0 && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">No results found</h3>
          <p className="text-sm text-neutral-600">
            Try adjusting your search terms or browse our categories
          </p>
        </div>
      )}
    </div>
  )
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search for products...",
  onSearch,
  onClear,
  suggestions = [],
  isLoading = false,
  className = "",
  size = 'md',
  showPopularSearches = true,
  showHistory = true
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigation = useNavigation()

  const isSubmitting = navigation.state === "submitting"

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch {
        // Ignore errors
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-10',
          input: 'pl-10 pr-20 text-sm',
          icon: 'w-4 h-4 left-3',
          button: 'px-3 py-1 text-sm'
        }
      case 'lg':
        return {
          container: 'h-14',
          input: 'pl-16 pr-32 text-lg',
          icon: 'w-6 h-6 left-5',
          button: 'px-6 py-2 text-base'
        }
      default:
        return {
          container: 'h-12',
          input: 'pl-12 pr-24 text-base',
          icon: 'w-5 h-5 left-4',
          button: 'px-4 py-2 text-sm'
        }
    }
  }, [size])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsDropdownOpen(true)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsDropdownOpen(true)
  }, [])

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    if (onSearch) {
      e.preventDefault()
      const trimmedQuery = query.trim()
      if (trimmedQuery) {
        // Add to search history
        const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 10)
        setSearchHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
        
        onSearch(trimmedQuery)
        setIsDropdownOpen(false)
        inputRef.current?.blur()
      }
    }
  }, [query, searchHistory, onSearch])

  const handleClear = useCallback(() => {
    setQuery("")
    setIsDropdownOpen(false)
    if (onClear) {
      onClear()
    }
    inputRef.current?.focus()
  }, [onClear])

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'query') {
      setQuery(suggestion.title)
      if (onSearch) {
        onSearch(suggestion.title)
      }
    }
    setIsDropdownOpen(false)
  }, [onSearch])

  const handleSelectHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery)
    if (onSearch) {
      onSearch(historyQuery)
    }
    setIsDropdownOpen(false)
  }, [onSearch])

  const handleSelectPopular = useCallback((popularQuery: string) => {
    setQuery(popularQuery)
    if (onSearch) {
      onSearch(popularQuery)
    }
    setIsDropdownOpen(false)
  }, [onSearch])

  const handleClearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem('searchHistory')
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false)
      inputRef.current?.blur()
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Form method="get" onSubmit={handleFormSubmit} className="relative">
        <div className={`relative ${sizeClasses.container}`}>
          {/* Search Icon */}
          <div className={`absolute inset-y-0 ${sizeClasses.icon} flex items-center pointer-events-none`}>
            <svg className={`${sizeClasses.icon.split(' ')[0]} ${sizeClasses.icon.split(' ')[1]} text-neutral-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            name="search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`block w-full ${sizeClasses.input} ${sizeClasses.container} border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 bg-white shadow-soft`}
            autoComplete="off"
          />

          {/* Clear/Submit Button */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {query.trim() ? (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-gradient-to-r from-brand-600 to-brand-700 text-white ${sizeClasses.button} rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-gradient-to-r from-brand-600 to-brand-700 text-white ${sizeClasses.button} rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Search'
                )}
              </button>
            )}
          </div>
        </div>
      </Form>

      {/* Dropdown */}
      <SearchDropdown
        isOpen={isDropdownOpen}
        query={query}
        suggestions={suggestions}
        searchHistory={showHistory ? searchHistory : []}
        popularSearches={showPopularSearches ? [...POPULAR_SEARCHES] : []}
        onSelectSuggestion={handleSelectSuggestion}
        onSelectHistory={handleSelectHistory}
        onSelectPopular={handleSelectPopular}
        onClearHistory={handleClearHistory}
        isLoading={isLoading}
      />
    </div>
  )
}

// Compact version for mobile headers
export function CompactSearchBar(props: Omit<SearchBarProps, 'size'>) {
  return <SearchBar {...props} size="sm" showPopularSearches={false} />
}

// Large version for hero sections
export function HeroSearchBar(props: Omit<SearchBarProps, 'size'>) {
  return <SearchBar {...props} size="lg" />
}