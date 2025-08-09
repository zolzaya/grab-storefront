import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, Link, Form, useActionData, useNavigation } from "@remix-run/react"
import { shopApiRequest } from "~/lib/graphql"
import { GET_ACTIVE_ORDER, GET_ORDER_BY_CODE, GET_PRODUCTS, ADD_ITEM_TO_ORDER } from "~/lib/queries"
import { formatPrice } from "~/utils/utils"

export const meta: MetaFunction = () => {
  return [
    { title: "Thank You - Order Confirmed!" },
    { name: "description", content: "Thank you for your purchase! Your order has been confirmed." },
  ]
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  featuredAsset?: { preview: string }
  variants: {
    id: string
    name: string
    price: number
    priceWithTax: number
    sku: string
  }[]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const orderCode = url.searchParams.get('orderCode')

  try {
    let order = null

    // First, try to get the order by code if provided
    if (orderCode) {
      try {
        const { orderByCode } = await shopApiRequest<{ orderByCode: { 
          id: string;
          code: string; 
          state: string; 
          totalWithTax: number;
          totalQuantity: number;
          lines: { 
            id: string; 
            quantity: number; 
            linePriceWithTax: number; 
            productVariant: { 
              product: { 
                name: string; 
                featuredAsset?: { preview: string } 
              } 
            } 
          }[]; 
          shippingWithTax?: number;
          customer?: {
            firstName?: string;
            lastName?: string;
            emailAddress: string;
          };
        } | null }>(GET_ORDER_BY_CODE, { code: orderCode }, request)
        
        if (orderByCode) {
          order = orderByCode
        }
      } catch (error) {
        console.log('Could not fetch order by code:', error)
      }
    }

    // Fallback to active order if no order found by code
    if (!order) {
      const { activeOrder } = await shopApiRequest<{ activeOrder: { 
        id: string;
        code: string; 
        state: string; 
        totalWithTax: number;
        totalQuantity: number;
        lines: { 
          id: string; 
          quantity: number; 
          linePriceWithTax: number; 
          productVariant: { 
            product: { 
              name: string; 
              featuredAsset?: { preview: string } 
            } 
          } 
        }[]; 
        shippingWithTax?: number;
        customer?: {
          firstName?: string;
          lastName?: string;
          emailAddress: string;
        };
      } | null }>(GET_ACTIVE_ORDER, undefined, request)
      
      if (activeOrder && !["AddingItems"].includes(activeOrder.state)) {
        order = activeOrder
      }
    }
    
    // If still no order found, redirect to home
    if (!order) {
      return redirect('/')
    }

    // Get upsell products (featured/popular products)
    const { products } = await shopApiRequest<{ products: { items: Product[] } }>(
      GET_PRODUCTS,
      { options: { take: 6, sort: { createdAt: "DESC" } } },
      request
    )

    // Filter out products already in the order and get upsell products
    const orderProductNames = order.lines.map(line => line.productVariant.product.name)
    const upsellProducts = products.items.filter(product => 
      !orderProductNames.includes(product.name)
    ).slice(0, 3)

    return { 
      order,
      upsellProducts,
      customerName: order.customer?.firstName || order.customer?.emailAddress?.split('@')[0] || 'Valued Customer'
    }
  } catch (error) {
    console.error('Failed to load checkout success:', error)
    return redirect('/')
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get("_action") as string
  const productVariantId = formData.get("productVariantId") as string

  if (action === "add-upsell") {
    try {
      const result = await shopApiRequest<any>(ADD_ITEM_TO_ORDER, {
        productVariantId,
        quantity: 1
      }, request)

      if ('errorCode' in result.addItemToOrder) {
        return { error: result.addItemToOrder.message }
      }

      return { success: true, message: "Item added to cart!" }
    } catch (error) {
      console.error('Failed to add upsell item:', error)
      return { error: "Failed to add item to cart. Please try again." }
    }
  }

  return { error: "Invalid action" }
}

export default function CheckoutSuccess() {
  const { order, upsellProducts, customerName } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 via-white to-brand-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-full mb-8 shadow-large">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Thank You, {customerName}! 🎉
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 mb-4">
            Your order has been confirmed and is being processed
          </p>
          <p className="text-lg text-neutral-500">
            Order #{order.code} • {order.totalQuantity} items • {formatPrice(order.totalWithTax + (order.shippingWithTax || 0))}
          </p>
        </div>

        {/* Success Messages */}
        {actionData?.success && (
          <div className="mb-8 animate-fade-in max-w-2xl mx-auto">
            <div className="p-6 bg-success-50 border-2 border-success-200 rounded-2xl shadow-soft">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-success-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-success-800 font-medium">{actionData.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {actionData?.error && (
          <div className="mb-8 animate-fade-in max-w-2xl mx-auto">
            <div className="p-6 bg-error-50 border-2 border-error-200 rounded-2xl shadow-soft">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-error-800 font-medium">{actionData.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
                <h2 className="text-2xl font-bold text-neutral-900">Your Order Details</h2>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  {order.lines.map((line, index) => (
                    <div key={line.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex-shrink-0">
                        {line.productVariant.product.featuredAsset ? (
                          <img
                            src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                            alt={line.productVariant.product.name}
                            className="w-16 h-16 object-cover rounded-xl shadow-soft"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">{line.productVariant.product.name}</h3>
                        <p className="text-neutral-600">Qty: {line.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-900">{formatPrice(line.linePriceWithTax)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-neutral-200 mt-6 pt-6">
                  <div className="flex justify-between items-center text-2xl font-bold text-neutral-900">
                    <span>Total Paid</span>
                    <span>{formatPrice(order.totalWithTax + (order.shippingWithTax || 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-soft p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Happens Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-brand-50 rounded-xl">
                  <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Email Confirmation</h4>
                  <p className="text-sm text-neutral-600">Check your email for order details and tracking info</p>
                </div>
                
                <div className="text-center p-6 bg-warning-50 rounded-xl">
                  <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Processing</h4>
                  <p className="text-sm text-neutral-600">We&apos;re preparing your order for shipment</p>
                </div>
                
                <div className="text-center p-6 bg-success-50 rounded-xl">
                  <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Fast Delivery</h4>
                  <p className="text-sm text-neutral-600">Your items will be delivered soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upsell Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-warning-50 to-warning-100">
                <h3 className="text-xl font-bold text-neutral-900 flex items-center">
                  <span className="text-2xl mr-2">✨</span>
                  Complete Your Setup
                </h3>
                <p className="text-sm text-neutral-600 mt-1">Popular items customers buy together</p>
              </div>

              <div className="p-6 space-y-4">
                {upsellProducts.length > 0 ? (
                  upsellProducts.map((product, index) => (
                    <div key={product.id} className="border border-neutral-200 rounded-xl p-4 hover:border-brand-300 transition-colors duration-200" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {product.featuredAsset ? (
                            <img
                              src={product.featuredAsset.preview + '?preset=thumb'}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-neutral-900 truncate">{product.name}</h4>
                          <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-brand-600">{formatPrice(product.variants[0]?.priceWithTax || 0)}</span>
                            <Form method="post" className="inline">
                              <input type="hidden" name="_action" value="add-upsell" />
                              <input type="hidden" name="productVariantId" value={product.variants[0]?.id} />
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-3 py-1 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium rounded-lg hover:from-brand-500 hover:to-brand-400 transition-all duration-200 shadow-medium hover:shadow-large transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                {isSubmitting ? '...' : 'Add'}
                              </button>
                            </Form>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No additional products available</p>
                  </div>
                )}

                {/* Special Offer Banner */}
                <div className="bg-gradient-to-r from-success-500 to-success-600 text-white p-4 rounded-xl text-center">
                  <p className="font-bold mb-1">🎁 Special Thank You Offer</p>
                  <p className="text-sm opacity-90">Get 15% off your next order with code: THANKYOU15</p>
                </div>

                {/* Continue Shopping */}
                <div className="pt-4">
                  <Link to="/products" className="block w-full">
                    <button className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-3 px-4 rounded-xl font-semibold hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                      Continue Shopping
                    </button>
                  </Link>
                  
                  <Link to="/" className="block w-full mt-3">
                    <button className="w-full bg-white text-neutral-900 py-3 px-4 rounded-xl font-semibold border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-soft hover:shadow-medium">
                      Back to Home
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Join Thousands of Happy Customers</h3>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-brand-600">10,000+</p>
                <p className="text-neutral-600">Orders Delivered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success-600">4.9/5</p>
                <p className="text-neutral-600">Customer Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning-600">24/7</p>
                <p className="text-neutral-600">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}