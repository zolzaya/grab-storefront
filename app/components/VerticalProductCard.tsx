import { Link } from "@remix-run/react";
import type { Product } from "~/lib/types";

interface VerticalProductCardProps {
  product: Product;
}

// Helper function to format Mongolian Tugrik
function formatPrice(price: number): string {
  return new Intl.NumberFormat('mn-MN').format(price) + ' ₮';
}

// Helper function to generate random discount percentage
function getRandomDiscount(): number {
  const discounts = [7, 10, 13, 15, 21, 23, 25, 28, 29, 30, 35];
  return discounts[Math.floor(Math.random() * discounts.length)];
}

export function VerticalProductCard({ product }: VerticalProductCardProps) {
  const variant = product.variants[0];
  const price = variant?.priceWithTax || 0;
  const discountPercent = getRandomDiscount();
  const originalPrice = Math.floor(price * (1 + discountPercent / 100));

  return (
    <Link to={`/products/${product.slug}`} className="block h-full">
      <div className="bg-white rounded shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Image Container - Very tall portrait format */}
        <div className="relative w-full h-56 overflow-hidden bg-gray-50 flex-shrink-0">
          {product.featuredAsset?.preview ? (
            <img
              src={product.featuredAsset.preview}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Discount Badge */}
          <div className="absolute top-0.5 left-0.5 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
            -{discountPercent}%
          </div>
        </div>

        {/* Product Info - Compact layout with more breathing room */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Product Title */}
            <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 leading-tight">
              {product.name}
            </h3>

            {/* Product Code */}
            <p className="text-xs text-gray-500 mb-1">#{variant?.sku || 'N/A'}</p>

            {/* Rating - More compact */}
            <div className="flex items-center mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-1.5 h-1.5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(47 сэтгэгдэл)</span>
            </div>
          </div>

          <div>
            {/* Pricing - More compact */}
            <div className="mb-1">
              <div className="text-xs text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </div>
              <div className="text-sm font-bold text-gray-900">
                {formatPrice(price)}
              </div>
            </div>

            {/* Bonus Points - Smaller dots and text */}
            <div className="flex items-center mb-1">
              <div className="w-1 h-1 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs text-red-600 font-medium">+25,976 ₮ Бонус</span>
            </div>

            {/* Monthly Payment - Smaller dots and text */}
            <div className="flex items-center mb-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-xs text-blue-600 font-medium">3,290 ₮ Сарын төлөлт</span>
            </div>

            {/* Stock Status */}
            <div className="text-xs text-green-600 mb-2">
              Завсрын онлайнаар
            </div>

            {/* Add to Cart Button - Smaller */}
            <button
              className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-1.5 rounded text-xs transition-colors duration-200 flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                // Add to cart logic here
              }}
            >
              <svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-3 8h18" />
              </svg>
              Сагслах
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}