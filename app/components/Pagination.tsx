import { useState, useEffect, useCallback } from "react";
import { ITEMS_PER_PAGE_OPTIONS } from "~/lib/constants";

export type PaginationStyle = 'standard' | 'loadmore' | 'infinite';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  style?: PaginationStyle;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  style = 'standard',
  hasNextPage,
  onLoadMore,
  loading = false,
  className = ""
}: PaginationProps) {

  // Standard pagination with page numbers
  const renderStandardPagination = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); 
           i <= Math.min(totalPages - 1, currentPage + delta); 
           i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-soft p-6">
        {/* Results info and items per page */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-0">
          <div className="text-neutral-700 text-sm">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          {onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-neutral-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {/* Page navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="hidden md:flex items-center space-x-1">
            {getVisiblePages().map((page, index) => (
              page === '...' ? (
                <span key={`dots-${index}`} className="px-3 py-2 text-neutral-400">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-brand-600 text-white shadow-medium'
                      : 'text-neutral-600 bg-white border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Mobile pagination info */}
          <div className="md:hidden px-4 py-2 text-sm text-neutral-600 bg-neutral-50 rounded-xl">
            {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Next
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // Load more button style
  const renderLoadMorePagination = () => (
    <div className="flex flex-col items-center space-y-4 bg-white rounded-2xl shadow-soft p-6">
      <div className="text-neutral-700 text-sm text-center">
        Showing {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
      </div>
      
      {hasNextPage && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="flex items-center px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold rounded-xl hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-medium"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              Load More
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );

  // Render based on pagination style
  if (totalPages <= 1 && style !== 'loadmore') return null;

  return (
    <div className={className}>
      {style === 'loadmore' ? renderLoadMorePagination() : renderStandardPagination()}
    </div>
  );
}

// Hook for infinite scroll
export function useInfiniteScroll(
  hasNextPage: boolean, 
  loading: boolean, 
  onLoadMore: () => void,
  threshold = 100
) {
  const handleScroll = useCallback(() => {
    if (loading || !hasNextPage) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [loading, hasNextPage, onLoadMore, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}

// Scroll position memory hook
export function useScrollMemory(key: string) {
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition));
    }
  }, [key]);

  useEffect(() => {
    const savePosition = () => {
      sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', savePosition);
    return () => window.removeEventListener('beforeunload', savePosition);
  }, [key]);
}