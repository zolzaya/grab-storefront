import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"

import { useLoaderData, useActionData, Form, Link } from "@remix-run/react"
import { PaymentMethods } from "../components/cart/PaymentMethods"
import { TrustBadges } from "../components/cart/TrustBadges"
import { shopApiRequest } from "~/lib/graphql"
import { GET_ACTIVE_ORDER, REMOVE_ORDER_LINE, ADJUST_ORDER_LINE } from "~/lib/queries"
import { Order, RemoveOrderLineResult, AdjustOrderLineResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Shopping Cart - Your Store" },
    { name: "description", content: "Review your shopping cart" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { activeOrder } = await shopApiRequest<{ activeOrder: Order | null }>(
      GET_ACTIVE_ORDER,
      undefined,
      request
    )

    return ({ activeOrder })
  } catch (error) {
    console.error('Failed to load cart:', error)
    return ({ activeOrder: null })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get("_action") as string

  try {
    if (action === "remove") {
      const orderLineId = formData.get("orderLineId") as string
      const result = await shopApiRequest<RemoveOrderLineResult>(
        REMOVE_ORDER_LINE,
        { orderLineId },
        request
      )

      if ('errorCode' in result.removeOrderLine) {
        return ({ error: result.removeOrderLine.message })
      }

      return ({ success: true, order: result.removeOrderLine })
    }

    if (action === "adjust") {
      const orderLineId = formData.get("orderLineId") as string
      const quantity = parseInt(formData.get("quantity") as string)

      if (quantity < 1) {
        return ({ error: "Quantity must be at least 1" })
      }

      const result = await shopApiRequest<AdjustOrderLineResult>(
        ADJUST_ORDER_LINE,
        { orderLineId, quantity },
        request
      )

      if ('errorCode' in result.adjustOrderLine) {
        return ({ error: result.adjustOrderLine.message })
      }

      return ({ success: true, order: result.adjustOrderLine })
    }

    return ({ error: "Invalid action" })
  } catch (error) {
    console.error('Cart action failed:', error)
    return ({ error: "Action failed. Please try again." })
  }
}

export default function Cart() {
  const { activeOrder } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price / 100)
  }

  if (!activeOrder || activeOrder.lines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-soft p-16 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl mx-auto mb-8 flex items-center justify-center">
                <svg className="h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Your Cart is Empty</h1>
              <p className="text-xl text-neutral-600 mb-8">
                Start shopping to add items to your cart and enjoy our premium products.
              </p>
              <Link to="/products" className="group inline-flex items-center">
                <button className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                  Start Shopping
                  <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Shopping Cart
            </h1>
            <p className="text-xl text-neutral-600">
              Review your items and proceed to checkout when ready
            </p>
          </div>
        </div>

        {/* Action Messages */}
        {actionData && 'error' in actionData && (
          <div className="mb-8 animate-fade-in">
            <div className="max-w-2xl mx-auto p-6 bg-error-50 border-2 border-error-200 rounded-2xl shadow-soft">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-error-800 font-medium">{actionData.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cart Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="px-8 py-6 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 9H6l-1-9z" />
                  </svg>
                  Cart Items ({activeOrder.totalQuantity})
                </h2>
              </div>

              <div className="divide-y divide-neutral-100">
                {activeOrder.lines.map((line, index) => (
                  <div key={line.id} className="p-8 hover:bg-neutral-50 transition-colors duration-200" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          {line.productVariant.product.featuredAsset ? (
                            <img
                              src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                              alt={line.productVariant.product.name}
                              className="w-24 h-24 object-cover rounded-2xl shadow-soft"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl shadow-soft flex items-center justify-center">
                              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${line.productVariant.product.slug}`}
                          className="group"
                        >
                          <h3 className="text-xl font-bold text-neutral-900 group-hover:text-brand-600 transition-colors duration-200 mb-2">
                            {line.productVariant.product.name}
                          </h3>
                        </Link>

                        {line.productVariant.name !== line.productVariant.product.name && (
                          <p className="text-neutral-600 mb-2 font-medium">{line.productVariant.name}</p>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-3">
                          <span className="bg-neutral-100 px-3 py-1 rounded-full">SKU: {line.productVariant.sku}</span>
                        </div>

                        {/* Mobile Quantity and Total */}
                        <div className="flex items-center justify-between md:hidden">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-neutral-700">Quantity:</span>
                            <Form method="post" className="flex items-center bg-neutral-100 rounded-xl">
                              <input type="hidden" name="_action" value="adjust" />
                              <input type="hidden" name="orderLineId" value={line.id} />
                              <button
                                type="submit"
                                name="quantity"
                                value={line.quantity - 1}
                                disabled={line.quantity <= 1}
                                className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-l-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="px-4 py-3 font-bold text-neutral-900 min-w-[3rem] text-center">{line.quantity}</span>
                              <button
                                type="submit"
                                name="quantity"
                                value={line.quantity + 1}
                                className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-r-xl transition-all duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </Form>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-neutral-900">
                              {formatPrice(line.linePriceWithTax)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Quantity Controls */}
                      <div className="hidden md:flex flex-shrink-0 items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm font-medium text-neutral-700 mb-2">Quantity</p>
                          <Form method="post" className="flex items-center bg-neutral-100 rounded-xl">
                            <input type="hidden" name="_action" value="adjust" />
                            <input type="hidden" name="orderLineId" value={line.id} />
                            <button
                              type="submit"
                              name="quantity"
                              value={line.quantity - 1}
                              disabled={line.quantity <= 1}
                              className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-l-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-3 font-bold text-neutral-900 min-w-[3rem] text-center">{line.quantity}</span>
                            <button
                              type="submit"
                              name="quantity"
                              value={line.quantity + 1}
                              className="p-3 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-r-xl transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </Form>
                        </div>

                        {/* Desktop Line Total */}
                        <div className="text-right min-w-[6rem]">
                          <p className="text-sm font-medium text-neutral-700 mb-2">Total</p>
                          <p className="text-2xl font-bold text-neutral-900">
                            {formatPrice(line.linePriceWithTax)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <div className="flex-shrink-0">
                          <Form method="post">
                            <input type="hidden" name="_action" value="remove" />
                            <input type="hidden" name="orderLineId" value={line.id} />
                            <button
                              type="submit"
                              className="p-3 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-xl transition-all duration-200 group"
                              title="Remove item from cart"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </Form>
                        </div>
                      </div>

                      {/* Mobile Remove Button */}
                      <div className="md:hidden flex justify-center">
                        <Form method="post">
                          <input type="hidden" name="_action" value="remove" />
                          <input type="hidden" name="orderLineId" value={line.id} />
                          <button
                            type="submit"
                            className="flex items-center px-6 py-3 text-error-600 hover:text-error-700 hover:bg-error-50 rounded-xl transition-all duration-200 font-medium"
                            title="Remove item from cart"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove Item
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
                  <h3 className="text-2xl font-bold text-neutral-900 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Order Summary
                  </h3>
                </div>

                <div className="p-8 space-y-6">
                  {/* Order Details */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Subtotal ({activeOrder.totalQuantity} {activeOrder.totalQuantity === 1 ? 'item' : 'items'})</span>
                      <span className="font-bold text-neutral-900">{formatPrice(activeOrder.total)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">Tax</span>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(activeOrder.totalWithTax - activeOrder.total)}
                      </span>
                    </div>

                    {activeOrder.shippingWithTax && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Shipping</span>
                        <span className="font-bold text-neutral-900">
                          {formatPrice(activeOrder.shippingWithTax)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-200"></div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-neutral-900">Total</span>
                    <span className="text-3xl font-bold text-neutral-900">
                      {formatPrice(activeOrder.totalWithTax + (activeOrder.shippingWithTax || 0))}
                    </span>
                  </div>

                  {/* Shipping Banner */}
                  <div className="bg-success-50 border border-success-200 rounded-2xl p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-success-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-success-800">Free Shipping!</p>
                        <p className="text-xs text-success-600">Your order qualifies for free shipping</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                      Proceed to Checkout
                    </button>

                    <Link to="/products" className="group w-full mt-4">
                      <button className="w-full bg-white text-neutral-900 py-4 px-6 rounded-2xl font-semibold text-lg border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-soft hover:shadow-medium">
                        Continue Shopping
                        <svg className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </Link>
                  </div>

                  {/* Payment Methods */}
                  <div className="border-t border-neutral-200 pt-6">
                    <PaymentMethods />
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8">
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}