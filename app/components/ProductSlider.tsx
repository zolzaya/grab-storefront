import { Link } from '@remix-run/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, FreeMode } from 'swiper/modules'
import { ClientOnly } from 'remix-utils/client-only'
import ProductCard from './ProductCard'
import { Product } from '~/lib/types'
import { useState, useEffect } from 'react'

interface ProductSliderProps {
  products: Product[]
  title: string
  subtitle?: string
  viewAllLink?: string
  titleClassName?: string
  sectionClassName?: string
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

export function ProductSlider({
  products,
  title,
  subtitle,
  viewAllLink = "/products",
  titleClassName = "text-2xl font-bold text-gray-900",
  sectionClassName = "py-6 bg-white"
}: ProductSliderProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate 3-second loading delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className={sectionClassName}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`${titleClassName} mb-1`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            to={viewAllLink}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
          >
            View all
          </Link>
        </div>
      </div>

      {/* Products Slider */}
      <div className="relative group overflow-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            // Skeleton Loading
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-48 sm:w-56 md:w-64">
                  <ProductSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <ClientOnly fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {products.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            }>
              {() => (
                <>
                  <Swiper
                    modules={[Navigation, FreeMode]}
                    spaceBetween={16}
                    slidesPerView="auto"
                    freeMode={true}
                    navigation={{
                      nextEl: '.product-slider-button-next',
                      prevEl: '.product-slider-button-prev',
                    }}
                    className="product-slider-swiper !overflow-visible w-full"
                  >
                    {products.map((product) => (
                      <SwiperSlide key={product.id} className="!w-48 sm:!w-56 md:!w-64">
                        <ProductCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <button className="product-slider-button-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="product-slider-button-next absolute right-2 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border border-gray-200 transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </ClientOnly>
          )}
        </div>
      </div>
    </section>
  )
}