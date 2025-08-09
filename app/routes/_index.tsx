import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ProductCard } from "~/components/ProductCard";
import { shopApiRequest } from "~/lib/graphql";
import { GET_PRODUCTS } from "~/lib/queries";
import { ProductList } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Your Store - Home" },
    { name: "description", content: "Welcome to Your Store! Discover amazing products." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { products } = await shopApiRequest<{ products: ProductList }>(
      GET_PRODUCTS,
      { options: { take: 8 } }
    );
    
    return { products };
  } catch (error) {
    console.error('Failed to load products:', error);
    return { products: { items: [], totalItems: 0 } };
  }
}

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Your Store
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover amazing products with unbeatable prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </Link>
              <Link to="/collections">
                <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
                  Browse Collections
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Check out our handpicked selection of the best products
          </p>
        </div>

        {products.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <p className="text-gray-400">
              Make sure your Vendure backend is running and has products
            </p>
          </div>
        )}

        {products.items.length > 0 && (
          <div className="text-center mt-12">
            <Link to="/products">
              <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors">
                View All Products
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your orders delivered quickly and safely to your doorstep
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">
                We carefully select and curate the best products for our customers
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">💯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Great Support</h3>
              <p className="text-gray-600">
                Our customer support team is always ready to help you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
