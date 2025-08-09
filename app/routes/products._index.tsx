import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, useSearchParams } from "@remix-run/react";
import { ProductCard } from "~/components/ProductCard";
import { shopApiRequest } from "~/lib/graphql";
import { GET_PRODUCTS } from "~/lib/queries";
import { ProductList } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Products - Your Store" },
    { name: "description", content: "Browse our complete collection of products" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const sort = url.searchParams.get("sort") || "relevance";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    // Define sort options
    const getSortOptions = (sortValue: string) => {
      switch (sortValue) {
        case "name-asc":
          return { name: "ASC" as const };
        case "name-desc":
          return { name: "DESC" as const };
        case "price-low":
          return { price: "ASC" as const };
        case "price-high":
          return { price: "DESC" as const };
        case "newest":
          return { createdAt: "DESC" as const };
        case "oldest":
          return { createdAt: "ASC" as const };
        default:
          return undefined; // relevance - no sorting
      }
    };

    const sortOptions = getSortOptions(sort);

    const options = {
      take: limit,
      skip,
      ...(sortOptions && { sort: sortOptions }),
      ...(search && {
        filter: {
          name: {
            contains: search
          }
        }
      })
    };

    const { products } = await shopApiRequest<{ products: ProductList }>(
      GET_PRODUCTS,
      { options },
      request
    );
    
    return ({ 
      products, 
      currentPage: page, 
      totalPages: Math.ceil(products.totalItems / limit),
      search,
      sort
    });
  } catch (error) {
    console.error('Failed to load products:', error);
    return ({ 
      products: { items: [], totalItems: 0 }, 
      currentPage: 1, 
      totalPages: 1,
      search,
      sort
    });
  }
}

export default function Products() {
  const { products, currentPage, totalPages, search, sort } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchTerm = formData.get("search") as string;
    
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm) {
      newParams.set("search", searchTerm);
    } else {
      newParams.delete("search");
    }
    newParams.delete("page"); // Reset to page 1 when searching
    
    setSearchParams(newParams);
  };

  const goToPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    const sortValue = event.target.value;
    
    if (sortValue === "relevance") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", sortValue);
    }
    newParams.delete("page"); // Reset to page 1 when sorting
    
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Our Products
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Discover our curated collection of premium products designed to enhance your lifestyle
            </p>
          </div>
          
          {/* Enhanced Search */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search for products..."
                  className="block w-full pl-14 pr-32 py-4 text-lg border-2 border-neutral-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-200 bg-white shadow-soft"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-6 py-2 rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
            
            {/* Search suggestions */}
            <div className="flex items-center justify-center mt-4 space-x-4 text-sm">
              <span className="text-neutral-600">Popular:</span>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Electronics</button>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Clothing</button>
              <button className="text-brand-600 hover:text-brand-700 font-medium">Home & Garden</button>
            </div>
          </div>
        </div>

        {/* Filters and Results Info */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 p-6 bg-white rounded-2xl shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Results Info */}
            <div className="text-neutral-700">
              <span className="font-semibold">{products.totalItems}</span> products found
              {search && (
                <span className="text-neutral-500"> for &ldquo;{search}&rdquo;</span>
              )}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-3">
              <label htmlFor="sort-select" className="text-sm font-medium text-neutral-700">Sort by:</label>
              <select 
                id="sort-select" 
                value={sort} 
                onChange={handleSortChange}
                className="px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              >
                <option value="relevance">Relevance</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 mt-4 lg:mt-0">
            <span className="text-sm font-medium text-neutral-700">View:</span>
            <div className="flex bg-neutral-100 rounded-xl p-1">
              <button className="px-3 py-2 text-sm font-medium rounded-lg bg-white text-neutral-900 shadow-soft">
                Grid
              </button>
              <button className="px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:text-neutral-900">
                List
              </button>
            </div>
          </div>
        </div>

        {products.items.length > 0 ? (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
              {products.items.map((product, index) => (
                <div key={product.id} style={{animationDelay: `${index * 0.05}s`}}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-2xl shadow-soft p-6">
                <div className="text-neutral-700 mb-4 sm:mb-0">
                  Showing page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 bg-white border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                            page === currentPage
                              ? 'bg-brand-600 text-white shadow-medium'
                              : 'text-neutral-600 bg-white border-2 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
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
            )}
          </>
        ) : (
          <div className="text-center py-24 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-soft p-16 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                {search ? `No products found for "${search}"` : "No products available"}
              </h3>
              <p className="text-neutral-600 mb-8">
                {search 
                  ? "Try adjusting your search terms or browse our categories" 
                  : "Check back later for new products or contact us for assistance"
                }
              </p>
              {search && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams();
                    setSearchParams(newParams);
                  }}
                  className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}