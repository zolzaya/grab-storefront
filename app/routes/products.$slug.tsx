import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { GET_PRODUCT, ADD_ITEM_TO_ORDER } from "~/lib/queries"
import { Product, AddItemToOrderResult } from "~/lib/types"

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const product = data?.product
  return [
    { title: product ? `${product.name} - Your Store` : "Product Not Found" },
    { name: "description", content: product?.description || "Product not found" },
  ]
}

export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params

  if (!slug) {
    throw new Response("Product not found", { status: 404 })
  }

  try {
    const { product } = await shopApiRequest<{ product: Product | null }>(
      GET_PRODUCT,
      { slug }
    )

    if (!product) {
      throw new Response("Product not found", { status: 404 })
    }

    return { product }
  } catch (error) {
    console.error('Failed to load product:', error)
    throw new Response("Product not found", { status: 404 })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const productVariantId = formData.get("productVariantId") as string
  const quantity = parseInt(formData.get("quantity") as string)

  if (!productVariantId || !quantity || quantity < 1) {
    return { error: "Invalid product or quantity" }
  }

  try {
    const result = await shopApiRequest<AddItemToOrderResult>(
      ADD_ITEM_TO_ORDER,
      { productVariantId, quantity }
    )

    if ('errorCode' in result.addItemToOrder) {
      return { error: result.addItemToOrder.message }
    }

    return { success: true, order: result.addItemToOrder }
  } catch (error) {
    console.error('Failed to add item to order:', error)
    return { error: "Failed to add item to cart" }
  }
}

export default function ProductDetail() {
  const { product } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0]
  const isLoading = navigation.state === "submitting"

  const images = product.assets && product.assets.length > 0 ? product.assets :
    (product.featuredAsset ? [product.featuredAsset] : [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price / 100)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <>
              <div className="aspect-square mb-4 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImageIndex].source || images[selectedImageIndex].preview + '?preset=large'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                        }`}
                    >
                      <img
                        src={image.preview + '?preset=thumb'}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center mb-4">
            {/* <SfRating size="sm" value={4.5} max={5} /> */}
            <span className="ml-2 text-sm text-gray-600">(4.5) • 124 reviews</span>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-6">
            {formatPrice(selectedVariant?.priceWithTax || 0)}
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-gray-600">{product.description}</p>
          </div>

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - {formatPrice(variant.priceWithTax)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedVariant?.stockLevel === 'OUT_OF_STOCK'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
              }`}>
              {selectedVariant?.stockLevel === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'}
            </span>
          </div>

          {/* Add to Cart */}
          <Form method="post" className="space-y-6">
            <input type="hidden" name="productVariantId" value={selectedVariantId} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  -
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {actionData && 'error' in actionData && (
              <div className="text-red-600 text-sm">{actionData.error}</div>
            )}

            {actionData && 'success' in actionData && (
              <div className="text-green-600 text-sm">Added to cart successfully!</div>
            )}

            {/* <SfButton
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading || selectedVariant?.stockLevel === 'OUT_OF_STOCK'}
            >
              {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
            </SfButton> */}
          </Form>

          {/* Product Details */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-1/3 text-sm font-medium text-gray-500">SKU:</dt>
                <dd className="text-sm text-gray-900">{selectedVariant?.sku}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}