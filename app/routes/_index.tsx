import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { CategoryIcon, featuredCategories } from "~/components/CategoryIcon"
import { shopApiRequest } from "~/lib/graphql"
import { GET_PRODUCTS } from "~/lib/queries"
import { ProductList } from "~/lib/types"

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules'
import { ClientOnly } from 'remix-utils/client-only'

// Banner images
import banner1 from "~/assets/1.webp"
import banner2 from "~/assets/2.webp"
import banner3 from "~/assets/3.webp"

export const meta: MetaFunction = () => {
  return [
    { title: "GRAB - Онлайн дэлгүүр" },
    { name: "description", content: "GRAB - Монголын хамгийн том онлайн дэлгүүр. Цахим техник, гэр ахуйн бараа, тавилга болон бусад бүтээгдэхүүнийг хямд үнээр худалдаж авна уу." },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Load different product sets for different sections with more diversity
    const [featuredProducts, saleProducts, newProducts] = await Promise.all([
      shopApiRequest<{ products: ProductList }>(
        GET_PRODUCTS,
        { options: { take: 12, skip: 0 } }
      ),
      shopApiRequest<{ products: ProductList }>(
        GET_PRODUCTS,
        { options: { take: 15, skip: 12 } }
      ),
      shopApiRequest<{ products: ProductList }>(
        GET_PRODUCTS,
        { options: { take: 15, skip: 27 } }
      )
    ])

    return {
      featuredProducts: featuredProducts.products,
      saleProducts: saleProducts.products,
      newProducts: newProducts.products
    }
  } catch (error) {
    console.error('Failed to load products:', error)
    return {
      featuredProducts: { items: [], totalItems: 0 },
      saleProducts: { items: [], totalItems: 0 },
      newProducts: { items: [], totalItems: 0 }
    }
  }
}

export default function Index() {
  const { featuredProducts, saleProducts, newProducts } = useLoaderData<typeof loader>()

  // Hero banners data - clean images without text
  const heroBanners = [
    {
      id: 1,
      image: banner1,
    },
    {
      id: 2,
      image: banner2,
    },
    {
      id: 3,
      image: banner3,
    }
  ]


  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width Banner Slider */}
      <section className="relative h-[500px] overflow-hidden">
        <ClientOnly fallback={
          <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
            <div className="text-gray-500">Loading banner...</div>
          </div>
        }>
          {() => (
            <>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                slidesPerGroup={1}
                centeredSlides={false}
                width={undefined}
                height={500}
                navigation={{
                  nextEl: '.hero-button-next',
                  prevEl: '.hero-button-prev',
                }}
                pagination={{
                  clickable: true,
                  el: '.hero-pagination',
                  type: 'bullets',
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                allowTouchMove={true}
                grabCursor={true}
                watchSlidesProgress={true}
                observeParents={true}
                observer={true}
                className="w-full h-[500px] hero-swiper"
              >
                {heroBanners.map((banner) => (
                  <SwiperSlide key={banner.id} className="w-full h-full">
                    <div
                      className="relative h-[500px] w-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${banner.image})` }}
                    >
                      {/* Clean image display with no text/captions */}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons for Banner Slider */}
              <button className="hero-button-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="hero-button-next absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Custom Pagination for Banner Slider */}
              <div className="hero-pagination absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30"></div>
            </>
          )}
        </ClientOnly>
      </section>

      {/* Modern Featured Products Section */}


      {/* Featured Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Онцлох ангилууд</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Таны хэрэгцээнд тохирсон бүтээгдэхүүнийг олоход туслах ангилуудыг хайгаарай</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {featuredCategories.map((category, index) => (
              <CategoryIcon
                key={index}
                name={category.name}
                slug={category.slug}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}