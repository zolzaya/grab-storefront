import { useState, useEffect, useRef, useCallback } from "react";
import { useFetcher } from "@remix-run/react";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  preview?: string;
  price?: number;
}

interface SearchSuggestion {
  term: string;
  category?: string;
  count?: number;
}

interface EnhancedSearchProps {
  defaultValue?: string;
  onSearch?: (term: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showRecent?: boolean;
  className?: string;
}

// Simple typo tolerance - Levenshtein distance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Fuzzy matching with typo tolerance
function fuzzyMatch(query: string, text: string, threshold: number = 2): boolean {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) return true;
  
  // Check if words are similar with typo tolerance
  const queryWords = queryLower.split(/\s+/);
  const textWords = textLower.split(/\s+/);
  
  return queryWords.some(queryWord => 
    textWords.some(textWord => 
      levenshteinDistance(queryWord, textWord) <= threshold
    )
  );
}

export function EnhancedSearch({
  defaultValue = "",
  onSearch,
  placeholder = "Search products...",
  showSuggestions = true,
  showRecent = true,
  className = ""
}: EnhancedSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();
  
  // Mock data for suggestions and popular searches
  const popularSearches = [
    { term: "iPhone", category: "Electronics", count: 234 },
    { term: "Nike shoes", category: "Footwear", count: 189 },
    { term: "Samsung TV", category: "Electronics", count: 156 },
    { term: "Laptop", category: "Computers", count: 143 },
    { term: "Headphones", category: "Audio", count: 127 },
    { term: "Coffee maker", category: "Kitchen", count: 98 },
  ];
  
  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, []);
  
  // Debounced search with typo tolerance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length > 2) {
        performSearch(query);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [query]);
  
  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate search with mock data
      const mockProducts = [
        { id: '1', name: 'iPhone 14 Pro', slug: 'iphone-14-pro', preview: '/images/iphone.jpg', price: 999 },
        { id: '2', name: 'Samsung Galaxy S23', slug: 'samsung-galaxy-s23', preview: '/images/samsung.jpg', price: 799 },
        { id: '3', name: 'Nike Air Max', slug: 'nike-air-max', preview: '/images/nike.jpg', price: 120 },
        { id: '4', name: 'MacBook Pro', slug: 'macbook-pro', preview: '/images/macbook.jpg', price: 1999 },
        { id: '5', name: 'AirPods Pro', slug: 'airpods-pro', preview: '/images/airpods.jpg', price: 249 },
        { id: '6', name: 'Coffee Machine', slug: 'coffee-machine', preview: '/images/coffee.jpg', price: 299 },
      ];
      
      // Filter with fuzzy matching for typo tolerance
      const filtered = mockProducts.filter(product => 
        fuzzyMatch(searchQuery, product.name)
      );
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);
    setIsOpen(value.length > 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    const totalItems = getTotalItems();
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        handleSelection(highlightedIndex);
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  const getTotalItems = () => {
    let count = 0;
    if (showRecent && recentSearches.length > 0 && query.length === 0) {
      count += Math.min(recentSearches.length, 3);
    }
    if (query.length === 0) {
      count += Math.min(popularSearches.length, 4);
    }
    if (searchResults.length > 0) {
      count += Math.min(searchResults.length, 5);
    }
    return count;
  };
  
  const handleSelection = (index: number) => {
    if (index === -1) return;
    
    let currentIndex = 0;
    
    // Recent searches
    if (showRecent && recentSearches.length > 0 && query.length === 0) {
      const recentCount = Math.min(recentSearches.length, 3);
      if (index < currentIndex + recentCount) {
        const selectedSearch = recentSearches[index - currentIndex];
        executeSearch(selectedSearch);
        return;
      }
      currentIndex += recentCount;
    }
    
    // Popular searches (when no query)
    if (query.length === 0) {
      const popularCount = Math.min(popularSearches.length, 4);
      if (index < currentIndex + popularCount) {
        const selectedSearch = popularSearches[index - currentIndex].term;
        executeSearch(selectedSearch);
        return;
      }
      currentIndex += popularCount;
    }
    
    // Search results
    if (searchResults.length > 0) {
      const resultIndex = index - currentIndex;
      if (resultIndex >= 0 && resultIndex < searchResults.length) {
        const selectedResult = searchResults[resultIndex];
        // Navigate to product or execute search
        window.location.href = `/products/${selectedResult.slug}`;
        return;
      }
    }
  };
  
  const executeSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setIsOpen(false);
    
    // Save to recent searches
    if (typeof window !== 'undefined') {
      const newRecent = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recent-searches', JSON.stringify(newRecent));
    }
    
    // Execute search
    onSearch?.(searchTerm);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query.trim());
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Highlight matching text with typo tolerance
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Simple highlighting for exact matches
    if (textLower.includes(queryLower)) {
      const index = textLower.indexOf(queryLower);
      const before = text.slice(0, index);
      const match = text.slice(index, index + query.length);
      const after = text.slice(index + query.length);
      
      return (
        <>
          {before}
          <span className="bg-yellow-200 font-semibold">{match}</span>
          {after}
        </>
      );
    }
    
    return text;
  };
  
  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="block w-full pl-12 pr-16 py-3 text-base border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200 bg-white shadow-soft"
            autoComplete="off"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <div className="p-2">
                <svg className="animate-spin h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <button
                type="submit"
                className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-4 py-2 rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium text-sm"
              >
                Search
              </button>
            )}
          </div>
        </div>
      </form>
      
      {/* Search Results Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Results */}
          <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 z-20 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto"
          >
            {query.length === 0 ? (
              /* Show recent and popular searches when no query */
              <div className="py-2">
                {/* Recent Searches */}
                {showRecent && recentSearches.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Recent Searches
                    </div>
                    {recentSearches.slice(0, 3).map((search, index) => (
                      <button
                        key={search}
                        onClick={() => executeSearch(search)}
                        className={`w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center space-x-3 ${
                          highlightedIndex === index ? 'bg-brand-50' : ''
                        }`}
                      >
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-neutral-700">{search}</span>
                      </button>
                    ))}
                    <div className="border-b border-neutral-100 my-2" />
                  </>
                )}
                
                {/* Popular Searches */}
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Popular Searches
                </div>
                {popularSearches.slice(0, 4).map((suggestion, index) => {
                  const actualIndex = showRecent && recentSearches.length > 0 ? 
                    index + Math.min(recentSearches.length, 3) : index;
                  
                  return (
                    <button
                      key={suggestion.term}
                      onClick={() => executeSearch(suggestion.term)}
                      className={`w-full text-left px-4 py-3 hover:bg-neutral-50 flex items-center justify-between ${
                        highlightedIndex === actualIndex ? 'bg-brand-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <div>
                          <div className="text-sm text-neutral-700">{suggestion.term}</div>
                          <div className="text-xs text-neutral-500">{suggestion.category}</div>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-400">{suggestion.count}</span>
                    </button>
                  );
                })}
              </div>
            ) : searchResults.length > 0 ? (
              /* Show search results */
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Products ({searchResults.length} found)
                </div>
                {searchResults.slice(0, 5).map((result, index) => (
                  <a
                    key={result.id}
                    href={`/products/${result.slug}`}
                    className={`block px-4 py-3 hover:bg-neutral-50 flex items-center space-x-3 ${
                      highlightedIndex === index ? 'bg-brand-50' : ''
                    }`}
                  >
                    {result.preview ? (
                      <img
                        src={result.preview}
                        alt={result.name}
                        className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900">
                        {highlightMatch(result.name, query)}
                      </div>
                      {result.price && (
                        <div className="text-sm text-neutral-600">
                          {formatPrice(result.price)}
                        </div>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
                
                {searchResults.length > 5 && (
                  <div className="px-4 py-3 border-t border-neutral-100 text-center">
                    <button
                      onClick={() => executeSearch(query)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      View all {searchResults.length} results
                    </button>
                  </div>
                )}
              </div>
            ) : query.length > 2 && !loading ? (
              /* No results found */
              <div className="py-8 text-center">
                <div className="text-neutral-400 mb-2">
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-sm text-neutral-600 mb-4">
                  No results found for "{query}"
                </div>
                <div className="text-xs text-neutral-500">
                  Try different keywords or check spelling
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}