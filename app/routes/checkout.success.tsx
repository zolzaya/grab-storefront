import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, Link } from "@remix-run/react"
import { shopApiRequest } from "~/lib/graphql"
import { GET_ACTIVE_ORDER } from "~/lib/queries"
import { formatPrice } from "~/utils/utils"

export const meta: MetaFunction = () => {
  return [
    { title: "Order Confirmed - Your Store" },
    { name: "description", content: "Your order has been successfully placed" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { activeOrder } = await shopApiRequest<{ activeOrder: { 
      state: string; 
      code: string; 
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
      totalWithTax: number; 
      shippingWithTax?: number 
    } | null }>(GET_ACTIVE_ORDER, undefined, request)
    
    // If there's no active order or it's still in cart state, redirect to home
    if (!activeOrder || activeOrder.state === 'AddingItems') {
      return redirect('/')
    }

    return { order: activeOrder }
  } catch (error) {
    console.error('Failed to load order:', error)
    return redirect('/')
  }
}

export default function CheckoutSuccess() {
  const { order } = useLoaderData<typeof loader>()

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-large p-16 max-w-2xl mx-auto">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-success-500 to-success-600 rounded-full mx-auto mb-8 flex items-center justify-center">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Order Confirmed!
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Thank you for your purchase. Your order has been successfully placed and will be processed soon.
            </p>

            {/* Order Details */}
            <div className="bg-neutral-50 rounded-2xl p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Order Details</h2>
                <p className="text-neutral-600">Order #{order.code}</p>
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {order.lines.map((line) => (
                  <div key={line.id} className="flex items-center justify-between p-4 bg-white rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {line.productVariant.product.featuredAsset ? (
                          <img
                            src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                            alt={line.productVariant.product.name}
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-neutral-900">{line.productVariant.product.name}</h3>
                        <p className="text-sm text-neutral-600">Qty: {line.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{formatPrice(line.linePriceWithTax)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-neutral-900">Total Paid</span>
                  <span className="font-bold text-neutral-900 text-2xl">
                    {formatPrice(order.totalWithTax + (order.shippingWithTax || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">What&apos;s Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-brand-50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Email Confirmation</h4>
                  <p className="text-sm text-neutral-600">You&apos;ll receive an email confirmation shortly</p>
                </div>
                
                <div className="bg-warning-50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Processing</h4>
                  <p className="text-sm text-neutral-600">We&apos;ll start preparing your order right away</p>
                </div>
                
                <div className="bg-success-50 p-6 rounded-xl">
                  <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-neutral-900 mb-2">Shipping</h4>
                  <p className="text-sm text-neutral-600">Your order will be shipped soon</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="w-full sm:w-auto bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-8 py-4 text-lg font-semibold rounded-2xl hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5">
                  Continue Shopping
                </button>
              </Link>
              
              <Link to="/">
                <button className="w-full sm:w-auto bg-white text-neutral-900 px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-neutral-300 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-300 shadow-soft hover:shadow-medium">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}