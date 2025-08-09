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
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const options = {
      take: limit,
      skip,
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
      { options }
    );
    
    return ({ 
      products, 
      currentPage: page, 
      totalPages: Math.ceil(products.totalItems / limit),
      search 
    });
  } catch (error) {
    console.error('Failed to load products:', error);
    return ({ 
      products: { items: [], totalItems: 0 }, 
      currentPage: 1, 
      totalPages: 1,
      search 
    });
  }
}

export default function Products() {
  const { products, currentPage, totalPages, search } = useLoaderData<typeof loader>();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Products</h1>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-md">
          <div className="flex gap-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="mb-6 text-sm text-gray-600">
        Showing {products.items.length} of {products.totalItems} products
        {search && (
          <span> for "{search}"</span>
        )}
      </div>

      {products.items.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">
            {search ? `No products found for "${search}"` : "No products found"}
          </p>
          {search && (
            <button
              onClick={() => {
                const newParams = new URLSearchParams();
                setSearchParams(newParams);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}