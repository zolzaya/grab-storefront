import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { CategoryIcon, featuredCategories } from "~/components/CategoryIcon"
import { BannerGrid } from "~/components/BannerGrid"
import { ProductSlider } from "~/components/ProductSlider"
import { shopApiRequest } from "~/lib/graphql"
import { GET_PRODUCTS } from "~/lib/queries"
import { ProductList } from "~/lib/types"

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

  return (
    <div className="min-h-screen">
      {/* Banner Grid Section */}
      <BannerGrid />

      {/* Fast Delivery Products Section */}
      <ProductSlider
        products={featuredProducts.items}
        title="Get it as fast as an hour"
        subtitle="Your faves, straight to your door."
        viewAllLink="/products"
        titleClassName="text-2xl font-bold text-gray-900"
        sectionClassName="py-6 bg-white"
      />

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