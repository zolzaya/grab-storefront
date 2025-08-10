import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, Link, useSearchParams } from "@remix-run/react"
import { shopApiRequest } from "~/lib/graphql"
import { ME, GET_CUSTOMER_ORDERS } from "~/lib/queries"
import { getCurrentUser, requireAuth, getFullName } from "~/lib/auth"
import { formatPrice } from "~/utils/utils"
import type { CurrentUser, Customer, CustomerOrder } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "My Account - Your Store" },
    { name: "description", content: "Manage your account, orders, and addresses" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  const [searchParams] = new URL(request.url).searchParams.entries()
  const welcomeParam = new URL(request.url).searchParams.get('welcome')

  try {
    // Get customer details and recent orders
    const { activeCustomer } = await shopApiRequest<{ activeCustomer: Customer & { orders: { items: CustomerOrder[], totalItems: number } } }>(
      GET_CUSTOMER_ORDERS,
      {
        options: {
          take: 3, // Just show recent orders on dashboard
          sort: { orderPlacedAt: 'DESC' }
        }
      },
      request
    )

    return { 
      user, 
      customer: activeCustomer,
      isWelcome: welcomeParam === 'true'
    }
  } catch (error) {
    console.error('Failed to load customer data:', error)
    return { 
      user, 
      customer: null, 
      isWelcome: welcomeParam === 'true'
    }
  }
}

export default function AccountDashboard() {
  const { user, customer, isWelcome } = useLoaderData<typeof loader>()
  
  const fullName = getFullName(user)
  const recentOrders = customer?.orders?.items || []
  const totalOrders = customer?.orders?.totalItems || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        {isWelcome && (
          <div className="mb-8 bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-success-900">Welcome to grab.mn!</h3>
                <p className="text-success-700">Your account has been successfully created and verified.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
                Hello, {fullName}! 👋
              </h1>
              <p className="text-xl text-neutral-600">
                Welcome to your account dashboard
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-large">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <Link to="/account/orders" className="group">
            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-300">
                    My Orders
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/account/addresses" className="group">
            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-300">
                    Addresses
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Manage shipping addresses
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/account/profile" className="group">
            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-300">
                    Profile
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Update personal info
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/account/security" className="group">
            <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-large transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-brand-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors duration-300">
                    Security
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Password & security
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-900">Recent Orders</h2>
                  {totalOrders > 3 && (
                    <Link to="/account/orders" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                      View all →
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-8">
                {recentOrders.length > 0 ? (
                  <div className="space-y-6">
                    {recentOrders.map((order, index) => (
                      <div 
                        key={order.id} 
                        className="border border-neutral-200 rounded-xl p-6 hover:border-brand-300 transition-colors duration-200"
                        style={{animationDelay: `${0.3 + index * 0.1}s`}}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-neutral-900">Order #{order.code}</h3>
                            <p className="text-sm text-neutral-600">
                              {new Date(order.orderPlacedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-neutral-900">{formatPrice(order.totalWithTax)}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              order.state === 'Delivered' ? 'bg-success-100 text-success-800' :
                              order.state === 'Shipped' ? 'bg-brand-100 text-brand-800' :
                              order.state === 'PaymentSettled' ? 'bg-warning-100 text-warning-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {order.state}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-2">
                            {order.lines.slice(0, 3).map((line, i) => (
                              <div key={i} className="w-10 h-10 bg-neutral-100 rounded-lg border-2 border-white overflow-hidden">
                                {line.productVariant.product.featuredAsset ? (
                                  <img
                                    src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                                    alt={line.productVariant.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.lines.length > 3 && (
                              <div className="w-10 h-10 bg-neutral-100 rounded-lg border-2 border-white flex items-center justify-center">
                                <span className="text-xs font-medium text-neutral-600">+{order.lines.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-600">
                              {order.totalQuantity} {order.totalQuantity === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                          <Link 
                            to={`/account/orders/${order.id}`} 
                            className="text-brand-600 hover:text-brand-700 font-medium text-sm"
                          >
                            View details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No orders yet</h3>
                    <p className="text-neutral-600 mb-6">Start shopping to see your orders here</p>
                    <Link 
                      to="/products" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white font-semibold rounded-xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Start shopping
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {/* Profile Summary */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-neutral-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span className="text-sm text-neutral-600">{user.emailAddress}</span>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-neutral-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-neutral-600">{user.phoneNumber}</span>
                  </div>
                )}
              </div>
              <Link 
                to="/account/profile" 
                className="mt-4 inline-flex items-center text-brand-600 hover:text-brand-700 font-medium text-sm"
              >
                Edit profile →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">{totalOrders}</div>
                  <div className="text-sm text-neutral-600">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">
                    {recentOrders.reduce((sum, order) => sum + order.totalQuantity, 0)}
                  </div>
                  <div className="text-sm text-neutral-600">Items Purchased</div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link to="/help" className="block text-sm text-neutral-600 hover:text-brand-600 transition-colors duration-200">
                  Help Center →
                </Link>
                <Link to="/contact" className="block text-sm text-neutral-600 hover:text-brand-600 transition-colors duration-200">
                  Contact Support →
                </Link>
                <Link to="/legal/returns" className="block text-sm text-neutral-600 hover:text-brand-600 transition-colors duration-200">
                  Returns & Refunds →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}