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

  const isOutOfStock = selectedVariant?.stockLevel === 'OUT_OF_STOCK'
  const hasDiscount = Math.random() > 0.7
  const originalPrice = hasDiscount ? (selectedVariant?.priceWithTax || 0) * 1.2 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <div className="animate-fade-in">
            {images.length > 0 ? (
              <>
                <div className="aspect-square mb-6 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl overflow-hidden shadow-large group">
                  <img
                    src={images[selectedImageIndex].source || images[selectedImageIndex].preview + '?preset=large'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {hasDiscount && (
                    <div className="absolute top-6 left-6 bg-error-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-medium">
                      Save {Math.round(((originalPrice - (selectedVariant?.priceWithTax || 0)) / originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex space-x-4 overflow-x-auto pb-2 mb-8">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-200 hover:scale-105 ${
                          index === selectedImageIndex 
                            ? 'border-brand-500 shadow-medium scale-105' 
                            : 'border-neutral-200 hover:border-brand-300'
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
              <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl flex items-center justify-center shadow-large mb-8">
                <div className="text-center">
                  <svg className="w-16 h-16 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-neutral-500 font-medium">No image available</span>
                </div>
              </div>
            )}

            {/* Description - moved here */}
            <div className="prose max-w-none">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Description</h3>
              <div className="text-lg text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            {/* Breadcrumb */}
            <nav className="flex mb-8" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li><a href="/" className="text-neutral-500 hover:text-brand-600 transition-colors">Home</a></li>
                <li><span className="text-neutral-400 mx-2">/</span></li>
                <li><a href="/products" className="text-neutral-500 hover:text-brand-600 transition-colors">Products</a></li>
                <li><span className="text-neutral-400 mx-2">/</span></li>
                <li><span className="text-neutral-900 font-medium truncate">{product.name}</span></li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < 4 ? 'text-warning-400' : 'text-neutral-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-3 text-sm text-neutral-600">
                <span className="font-medium">4.5</span> • <span className="hover:text-brand-600 cursor-pointer transition-colors">124 reviews</span>
              </span>
            </div>

            {/* Price & Availability */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-4xl font-bold text-neutral-900">
                    {formatPrice(selectedVariant?.priceWithTax || 0)}
                  </div>
                  {hasDiscount && (
                    <div className="text-2xl font-medium text-neutral-500 line-through">
                      {formatPrice(originalPrice)}
                    </div>
                  )}
                </div>
                
                {/* Stock Status Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 ${
                  isOutOfStock
                    ? 'bg-error-50 text-error-800 border-error-200'
                    : 'bg-success-50 text-success-800 border-success-200'
                }`}>
                  <svg className={`w-4 h-4 mr-2 ${isOutOfStock ? 'text-error-600' : 'text-success-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isOutOfStock ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  {isOutOfStock ? 'Out of Stock' : `${selectedVariant?.stockLevel} In Stock`}
                </div>
              </div>
              <p className="text-neutral-600">Price includes tax and shipping</p>
            </div>


            {/* Variant Selection */}
            {product.variants.length > 1 && (
              <div className="mb-8">
                <label className="block text-lg font-semibold text-neutral-900 mb-4">
                  Choose Variant
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="block w-full px-6 py-4 text-lg border-2 border-neutral-300 rounded-2xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white transition-all duration-200"
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name} - {formatPrice(variant.priceWithTax)}
                    </option>
                  ))}
                </select>
              </div>
            )}


            {/* Add to Cart */}
            <Form method="post" className="space-y-8">
              <input type="hidden" name="productVariantId" value={selectedVariantId} />

              {/* Quantity, Add to Cart, and Wishlist in same row */}
              <div>
                <label className="block text-lg font-semibold text-neutral-900 mb-4">
                  Quantity & Actions
                </label>
                <div className="flex items-center space-x-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center bg-neutral-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-4 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-l-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-20 text-center py-4 text-lg font-bold bg-transparent text-neutral-900">
                      {quantity}
                    </span>
                    <input type="hidden" name="quantity" value={quantity} />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-4 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-r-2xl transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isOutOfStock}
                    className="flex-1 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 px-6 text-lg font-bold rounded-2xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                        </svg>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  
                  {/* Wishlist Button */}
                  <button
                    type="button"
                    className="bg-white text-neutral-900 py-4 px-4 text-lg font-semibold rounded-2xl border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-soft hover:shadow-medium flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Messages */}
              {actionData && 'error' in actionData && (
                <div className="p-6 bg-error-50 border-2 border-error-200 rounded-2xl shadow-soft">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-error-800 font-medium">{actionData.error}</p>
                  </div>
                </div>
              )}

              {actionData && 'success' in actionData && (
                <div className="p-6 bg-success-50 border-2 border-success-200 rounded-2xl shadow-soft">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-success-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-success-800 font-medium">Added to cart successfully!</p>
                      <p className="text-success-600 text-sm mt-1">View cart or continue shopping</p>
                    </div>
                  </div>
                </div>
              )}
            </Form>

            {/* Trust Badges */}
            <div className="mt-8 p-6 bg-neutral-50 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Free Returns</p>
                    <p className="text-sm text-neutral-600">30-day policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Fast Shipping</p>
                    <p className="text-sm text-neutral-600">2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Secure Payment</p>
                    <p className="text-sm text-neutral-600">SSL encrypted</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-12 border-t border-neutral-200 pt-12">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Product Details</h3>
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <dl className="divide-y divide-neutral-100">
                  <div className="px-8 py-6 flex items-center justify-between">
                    <dt className="text-lg font-semibold text-neutral-900">SKU</dt>
                    <dd className="text-lg text-neutral-700 font-medium">{selectedVariant?.sku}</dd>
                  </div>
                  <div className="px-8 py-6 flex items-center justify-between">
                    <dt className="text-lg font-semibold text-neutral-900">Availability</dt>
                    <dd className="text-lg text-neutral-700 font-medium">{isOutOfStock ? 'Out of Stock' : 'In Stock'}</dd>
                  </div>
                  <div className="px-8 py-6 flex items-center justify-between">
                    <dt className="text-lg font-semibold text-neutral-900">Category</dt>
                    <dd className="text-lg text-neutral-700 font-medium">General</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}