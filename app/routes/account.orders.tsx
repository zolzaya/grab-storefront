import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { GET_CUSTOMER_ORDERS } from "~/lib/queries"
import { getCurrentUser, requireAuth, getFullName } from "~/lib/auth"
import type { CurrentUser, CustomerWithOrdersAndAddresses, OrderListOptions } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Order History - My Account" },
    { name: "description", content: "View your order history and track deliveries" },
  ]
}

interface LoaderData {
  user: CurrentUser
  customer: CustomerWithOrdersAndAddresses
  currentPage: number
  totalPages: number
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") || "1", 10)
  const limit = 10
  const skip = (page - 1) * limit

  const options: OrderListOptions = {
    take: limit,
    skip,
    sort: { orderPlacedAt: 'DESC' }
  }

  try {
    const { activeCustomer } = await shopApiRequest<{ activeCustomer: CustomerWithOrdersAndAddresses }>(
      GET_CUSTOMER_ORDERS,
      { options },
      request
    )

    if (!activeCustomer?.orders) {
      throw new Error("Could not fetch customer orders")
    }

    const totalPages = Math.ceil(activeCustomer.orders.totalItems / limit)

    return {
      user,
      customer: activeCustomer,
      currentPage: page,
      totalPages
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    throw new Response("Failed to load orders", { status: 500 })
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price / 100)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

function getOrderStatusColor(state: string): string {
  switch (state.toLowerCase()) {
    case 'delivered':
    case 'shipped':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'cancelled':
    case 'modifying':
      return 'text-error-600 bg-error-50 border-error-200'
    case 'paymentauthorized':
    case 'paymentpartiallyrefunded':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    case 'draft':
    case 'addingtocart':
      return 'text-neutral-600 bg-neutral-50 border-neutral-200'
    default:
      return 'text-brand-600 bg-brand-50 border-brand-200'
  }
}

function getReadableOrderState(state: string): string {
  switch (state.toLowerCase()) {
    case 'paymentauthorized': return 'Payment Authorized'
    case 'paymentpartiallyrefunded': return 'Partially Refunded'
    case 'addingtocart': return 'Adding to Cart'
    default: return state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()
  }
}

export default function Orders() {
  const { user, customer, currentPage, totalPages } = useLoaderData<LoaderData>()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const orders = customer.orders?.items || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <Link 
              to="/account" 
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Account
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">Order History</h1>
              <p className="text-xl text-neutral-600">Track your orders and view purchase history</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {getFullName(user).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{getFullName(user)}</p>
                    <p className="text-sm text-neutral-600">{user.emailAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-8">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">No Orders Yet</h3>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to see your order history here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-8">
            {orders.map((order, index) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl shadow-large overflow-hidden animate-fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                        <h3 className="text-xl font-bold text-neutral-900">Order #{order.code}</h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.state)}`}>
                          {getReadableOrderState(order.state)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-500">Order Date:</span>
                          <p className="font-medium text-neutral-900">{formatDate(order.orderPlacedAt)}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Total:</span>
                          <p className="font-bold text-neutral-900">{formatPrice(order.totalWithTax)}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Items:</span>
                          <p className="font-medium text-neutral-900">{order.totalQuantity} items</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-4 lg:mt-0">
                      <button
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        className="px-4 py-2 text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors duration-200 font-medium"
                      >
                        {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <Link
                        to={`/products`}
                        className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl transition-colors duration-200 font-medium"
                      >
                        Reorder
                      </Link>
                    </div>
                  </div>

                  {/* Order Details */}
                  {selectedOrder === order.id && (
                    <div className="mt-8 pt-6 border-t border-neutral-200 animate-fade-in">
                      <h4 className="text-lg font-semibold text-neutral-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.lines.map((line) => (
                          <div key={line.id} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-xl">
                            <div className="flex-shrink-0 w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                              {line.productVariant.product.featuredAsset ? (
                                <img
                                  src={line.productVariant.product.featuredAsset.preview}
                                  alt={line.productVariant.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-neutral-900">{line.productVariant.product.name}</h5>
                              <p className="text-sm text-neutral-600">{line.productVariant.name}</p>
                              <p className="text-sm text-neutral-500">SKU: {line.productVariant.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-neutral-500">Qty: {line.quantity}</p>
                              <p className="font-semibold text-neutral-900">{formatPrice(line.linePriceWithTax)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-neutral-900 mb-3">Shipping Address</h4>
                          <div className="bg-neutral-50 rounded-xl p-4">
                            <p className="font-medium text-neutral-900">{order.shippingAddress.fullName}</p>
                            {order.shippingAddress.company && (
                              <p className="text-neutral-700">{order.shippingAddress.company}</p>
                            )}
                            <p className="text-neutral-700">{order.shippingAddress.streetLine1}</p>
                            {order.shippingAddress.streetLine2 && (
                              <p className="text-neutral-700">{order.shippingAddress.streetLine2}</p>
                            )}
                            <p className="text-neutral-700">
                              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-neutral-700">{order.shippingAddress.country}</p>
                            {order.shippingAddress.phoneNumber && (
                              <p className="text-neutral-700">{order.shippingAddress.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                {currentPage > 1 && (
                  <Link
                    to={`/account/orders?page=${currentPage - 1}`}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors duration-200 font-medium"
                  >
                    Previous
                  </Link>
                )}
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      to={`/account/orders?page=${page}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-colors duration-200 ${
                        page === currentPage
                          ? 'bg-brand-600 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {page}
                    </Link>
                  ))}
                </div>

                {currentPage < totalPages && (
                  <Link
                    to={`/account/orders?page=${currentPage + 1}`}
                    className="px-4 py-2 text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors duration-200 font-medium"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}