import { Link } from "@remix-run/react";
import type { Product } from "~/lib/types";
import { useState } from "react";

interface HomeProductCardProps {
  product: Product;
  showDiscount?: boolean;
  showBonus?: boolean;
  showInstallment?: boolean;
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

// Helper function to generate random bonus points
function getRandomBonus(): number {
  return Math.floor(Math.random() * 50000) + 10000;
}

// Helper function to generate random installment
function getRandomInstallment(price: number): number {
  return Math.floor(price / 12);
}

// Helper function to generate random days left
function getRandomDaysLeft(): number {
  return Math.floor(Math.random() * 15) + 5;
}

export function HomeProductCard({
  product,
  showDiscount = true,
  showBonus = true,
  showInstallment = true
}: HomeProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const variant = product.variants[0];
  const price = variant?.priceWithTax || 0;

  // Generate random promotional data
  const discountPercent = getRandomDiscount();
  const originalPrice = Math.floor(price * (1 + discountPercent / 100));
  const bonusPoints = getRandomBonus();
  const monthlyPayment = getRandomInstallment(price);
  const daysLeft = getRandomDaysLeft();
  const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 - 5.0
  const reviewCount = Math.floor(Math.random() * 50);

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.featuredAsset?.preview ? (
            <img
              src={product.featuredAsset.preview}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Discount Badge */}
          {showDiscount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Bestseller Badge */}
          {Math.random() > 0.7 && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Bestseller
            </div>
          )}

          {/* Sale countdown */}
          {showDiscount && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Хямдрал дуусах {daysLeft} өдөр
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Title */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Product Code */}
          <p className="text-xs text-gray-500 mb-2">#{variant?.sku || 'N/A'}</p>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(parseFloat(rating)) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({reviewCount} сэтгэгдэл)</span>
          </div>

          {/* Pricing */}
          <div className="mb-3">
            {showDiscount && (
              <div className="text-xs text-gray-500 line-through mb-1">
                {formatPrice(originalPrice)}
              </div>
            )}
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(price)}
            </div>
          </div>

          {/* Bonus Points */}
          {showBonus && (
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-red-600 font-medium">+{formatPrice(bonusPoints)} Бонус</span>
            </div>
          )}

          {/* Monthly Payment */}
          {showInstallment && (
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-xs text-blue-600 font-medium">{formatPrice(monthlyPayment)} Сарын төлөлт</span>
            </div>
          )}

          {/* Stock Status */}
          <div className="text-xs text-green-600 mb-3">
            Завсрын онлайнаар
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          onClick={(e) => {
            e.preventDefault();
            // Add to cart logic here
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-3 8h18" />
          </svg>
          Сагслах
        </button>
      </div>
    </div>
  );
}