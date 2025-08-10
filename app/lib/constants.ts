import type { SortOption } from "./types";

export const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Relevance" },
  { value: "name-asc", label: "Name: A to Z", field: "name", direction: "ASC" },
  { value: "name-desc", label: "Name: Z to A", field: "name", direction: "DESC" },
  { value: "price-low", label: "Price: Low to High", field: "price", direction: "ASC" },
  { value: "price-high", label: "Price: High to Low", field: "price", direction: "DESC" },
  { value: "newest", label: "Newest First", field: "createdAt", direction: "DESC" },
  { value: "oldest", label: "Oldest First", field: "createdAt", direction: "ASC" },
  { value: "rating-high", label: "Highest Rated", field: "reviewRating", direction: "DESC" },
  { value: "rating-low", label: "Lowest Rated", field: "reviewRating", direction: "ASC" },
  { value: "most-reviewed", label: "Most Reviewed", field: "reviewCount", direction: "DESC" },
  { value: "bestselling", label: "Best Selling", field: "bestselling", direction: "DESC" },
  { value: "updated", label: "Recently Updated", field: "updatedAt", direction: "DESC" },
];

export const DEFAULT_PRODUCTS_LIMIT = 12;
export const DEFAULT_COLLECTIONS_LIMIT = 50;

export const AVAILABILITY_OPTIONS = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "pre_order", label: "Pre-order" },
] as const;

export const VIEW_MODES = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
] as const;

export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 12, label: "12" },
  { value: 24, label: "24" },
  { value: 48, label: "48" },
  { value: 96, label: "96" },
] as const;

export const RATING_FILTERS = [
  { value: 5, label: "5 stars" },
  { value: 4, label: "4+ stars" },
  { value: 3, label: "3+ stars" },
  { value: 2, label: "2+ stars" },
  { value: 1, label: "1+ stars" },
] as const;

// Popular search suggestions (these would typically come from analytics)
export const POPULAR_SEARCHES = [
  "Electronics",
  "Clothing", 
  "Home & Garden",
  "Sports & Outdoors",
  "Books",
  "Beauty",
  "Toys & Games",
  "Automotive"
] as const;