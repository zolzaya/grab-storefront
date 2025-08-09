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
      {/* Hero Section - Enhanced Shopify Style */}
      <section className="relative min-h-[85vh] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-neutral-50 to-brand-100"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[85vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-sm font-medium rounded-full shadow-soft">
                  <span>✨ New Collection Available</span>
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 leading-tight">
                  Discover your
                  <span className="block bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                    next favorite
                  </span>
                  thing
                </h1>
                <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed max-w-lg">
                  Curated products that blend style with functionality. Find exactly what you&apos;re looking for and more.
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="group">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                    Shop Collection
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </Link>
                <Link to="/collections" className="group">
                  <button className="w-full sm:w-auto bg-white text-neutral-900 px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-soft hover:shadow-medium">
                    Browse Categories
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </Link>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-white shadow-soft"></div>
                    ))}
                  </div>
                  <span className="text-sm text-neutral-600 font-medium">2,000+ happy customers</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-neutral-600 font-medium ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="relative">
                {/* Main Hero Card */}
                <div className="bg-white rounded-3xl shadow-large p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-200 rounded-2xl mb-6 flex items-center justify-center">
                    <div className="text-center text-brand-700">
                      <svg className="mx-auto h-20 w-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="text-lg font-bold">Premium Products</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Featured Collection</h3>
                  <p className="text-neutral-600 mb-4">Curated just for you</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-neutral-900">$99.99</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-warning-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-success-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-medium animate-bounce-soft">
                  Sale
                </div>
                <div className="absolute -bottom-6 -left-4 w-20 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white text-sm font-medium shadow-medium">
                  Free Ship
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-neutral-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-neutral-100 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 text-sm font-medium rounded-full mb-6">
              <span>🏆 Bestsellers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Featured Products
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Hand-picked favorites from our collection. These are the products our customers love most.
            </p>
          </div>

          {products.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.items.map((product, index) => (
                  <div key={product.id} style={{animationDelay: `${index * 0.1}s`}}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              {/* View All Products CTA */}
              <div className="text-center mt-16">
                <Link to="/products" className="group inline-flex items-center">
                  <button className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                    View All Products
                    <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-24 animate-fade-in">
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl p-16 max-w-lg mx-auto">
                <svg className="mx-auto h-16 w-16 text-neutral-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">No products found</h3>
                <p className="text-neutral-600 mb-8">
                  Make sure your Vendure backend is running and has products to display.
                </p>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-brand-500 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-neutral-500">Loading products...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-neutral-50 via-white to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              We&apos;re committed to providing exceptional service and quality products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl shadow-large mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Free Shipping</h3>
              <p className="text-neutral-600 leading-relaxed">
                Free worldwide shipping on orders over $75. Fast and reliable delivery to your doorstep.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 text-white rounded-2xl shadow-large mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Quality Guarantee</h3>
              <p className="text-neutral-600 leading-relaxed">
                All products are carefully tested and quality-checked before shipping to ensure excellence.
              </p>
            </div>
            
            <div className="text-center group animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-error-500 to-error-600 text-white rounded-2xl shadow-large mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                </svg>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-neutral-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">30</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Easy Returns</h3>
              <p className="text-neutral-600 leading-relaxed">
                30-day hassle-free return policy. Not satisfied? Return it for a full refund.
              </p>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t border-neutral-200">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">2K+</div>
              <div className="text-neutral-600 font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">500+</div>
              <div className="text-neutral-600 font-medium">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">99%</div>
              <div className="text-neutral-600 font-medium">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">24/7</div>
              <div className="text-neutral-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
