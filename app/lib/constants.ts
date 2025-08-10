import type { SortOption } from "./types";

export const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Best Match", field: "relevance", direction: "DESC", category: "featured" },
  { value: "bestselling", label: "Best Selling", field: "bestselling", direction: "DESC", category: "featured" },
  { value: "trending", label: "Trending", field: "trending", direction: "DESC", category: "featured" },
  { value: "featured", label: "Featured", field: "featured", direction: "DESC", category: "featured" },
  { value: "newest", label: "Newest", field: "createdAt", direction: "DESC", category: "time" },
  { value: "oldest", label: "Oldest", field: "createdAt", direction: "ASC", category: "time" },
  { value: "updated", label: "Recently Updated", field: "updatedAt", direction: "DESC", category: "time" },
  { value: "price-low", label: "Price: Low to High", field: "price", direction: "ASC", category: "price" },
  { value: "price-high", label: "Price: High to Low", field: "price", direction: "DESC", category: "price" },
  { value: "name-asc", label: "Name: A to Z", field: "name", direction: "ASC", category: "alphabetical" },
  { value: "name-desc", label: "Name: Z to A", field: "name", direction: "DESC", category: "alphabetical" },
  { value: "rating-high", label: "Highest Rated", field: "reviewRating", direction: "DESC", category: "reviews" },
  { value: "most-reviewed", label: "Most Reviewed", field: "reviewCount", direction: "DESC", category: "reviews" },
  { value: "most-popular", label: "Most Popular This Week", field: "popularityScore", direction: "DESC", category: "featured" },
  { value: "staff-picks", label: "Staff Picks", field: "staffPicks", direction: "DESC", category: "featured" },
  { value: "customer-favorites", label: "Customer Favorites", field: "customerFavorites", direction: "DESC", category: "featured" },
];

export const SORT_CATEGORIES = {
  featured: "Featured",
  time: "By Date",
  price: "By Price",
  alphabetical: "Alphabetical",
  reviews: "By Reviews"
} as const;

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