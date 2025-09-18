import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { HomeProductCard } from "~/components/HomeProductCard"
import { VerticalProductCard } from "~/components/VerticalProductCard"
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
      {/* Hero Section - 75% Banner Slider + 30% Featured Products Slider */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="flex h-full">
          {/* Left 75% - Banner Slider */}
          <div className="w-[75%] relative">
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
          </div>

          {/* Right 25% - Featured Products Horizontal Swiper */}
          <div className="w-[25%] bg-white relative">
            <div className="h-full p-3 flex flex-col">

              {featuredProducts.items.length > 0 ? (
                <div className="flex-1">
                  <ClientOnly fallback={
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-500 text-sm">Loading products...</div>
                    </div>
                  }>
                    {() => (
                      <Swiper
                        modules={[Autoplay]}
                        direction="horizontal"
                        spaceBetween={0}
                        slidesPerView={1}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                        }}
                        loop={true}
                        allowTouchMove={true}
                        speed={500}
                        className="h-full horizontal-products-swiper"
                      >
                        {featuredProducts.items.slice(0, 8).map((product) => (
                          <SwiperSlide key={product.id} className="h-full">
                            <div className="h-full flex items-center">
                              <VerticalProductCard product={product} />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    )}
                  </ClientOnly>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">Бүтээгдэхүүн олдсонгүй...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


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


      {/* Sale Products Section - Horizontal Scroll with Swiper */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Хямдралтай бүтээгдэхүүн</h2>
              <p className="text-gray-600">Зөвхөн өнөөдөр хүчинтэй хямдрал</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                🔥 Халуун хямдрал
              </span>
            </div>
          </div>

          {saleProducts.items.length > 0 ? (
            <div className="relative">
              <ClientOnly fallback={
                <div className="h-64 flex items-center justify-center">
                  <div className="text-gray-500">Loading sale products...</div>
                </div>
              }>
                {() => (
                  <>
                    <Swiper
                      modules={[Navigation, FreeMode]}
                      spaceBetween={16}
                      slidesPerView="auto"
                      navigation={{
                        nextEl: '.sale-button-next',
                        prevEl: '.sale-button-prev',
                      }}
                      freeMode={true}
                      watchSlidesProgress={true}
                      observeParents={true}
                      observer={true}
                      className="sale-products-swiper"
                    >
                      {saleProducts.items.slice(0, 12).map((product) => (
                        <SwiperSlide key={product.id} className="!w-64">
                          <HomeProductCard
                            product={product}
                            showDiscount={true}
                            showBonus={true}
                            showInstallment={true}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Custom Navigation Buttons */}
                    <button className="sale-button-prev absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button className="sale-button-next absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-lg border">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </ClientOnly>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">Бүтээгдэхүүн олдсонгүй...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}