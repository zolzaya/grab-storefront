import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { 
  GET_ACTIVE_ORDER, 
  ELIGIBLE_SHIPPING_METHODS,
  ELIGIBLE_PAYMENT_METHODS,
  SET_CUSTOMER_FOR_ORDER,
  SET_ORDER_SHIPPING_ADDRESS,
  SET_ORDER_BILLING_ADDRESS,
  SET_ORDER_SHIPPING_METHOD,
  ADD_PAYMENT_TO_ORDER,
  TRANSITION_ORDER_TO_STATE,
  GET_ORDER_BY_CODE,
  GET_PRODUCTS,
  ADD_ITEM_TO_ORDER
} from "~/lib/queries"
import { formatPrice } from "~/utils/utils"

export const meta: MetaFunction = () => {
  return [
    { title: "Checkout - Your Store" },
    { name: "description", content: "Complete your order" },
  ]
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  priceWithTax: number
}

interface PaymentMethod {
  id: string
  name: string
  code: string
  description: string
  isEligible: boolean
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
  const step = url.searchParams.get('step')
  const orderCode = url.searchParams.get('orderCode')

  try {
    // Get active order
    const { activeOrder } = await shopApiRequest<{ activeOrder: { lines: unknown[]; customer?: { id: string } } | null }>(GET_ACTIVE_ORDER, undefined, request)
    
    if (!activeOrder || activeOrder.lines.length === 0) {
      // If we're in thank-you step and no active order, try to get order by code
      if (step === 'thank-you' && orderCode) {
        try {
          const { orderByCode } = await shopApiRequest<{ orderByCode: any }>(GET_ORDER_BY_CODE, { code: orderCode }, request)
          if (orderByCode) {
            // Get upsell products for thank-you step
            const { products } = await shopApiRequest<{ products: { items: Product[] } }>(
              GET_PRODUCTS,
              { options: { take: 6, sort: { createdAt: "DESC" } } },
              request
            )
            
            const orderProductNames = orderByCode.lines.map((line: any) => line.productVariant.product.name)
            const upsellProducts = products.items.filter(product => 
              !orderProductNames.includes(product.name)
            ).slice(0, 3)

            return {
              activeOrder: null,
              completedOrder: orderByCode,
              upsellProducts,
              customerName: orderByCode.customer?.firstName || orderByCode.customer?.emailAddress?.split('@')[0] || 'Valued Customer',
              shippingMethods: [],
              paymentMethods: [],
              hasCustomer: false
            }
          }
        } catch (error) {
          console.error('Failed to load completed order:', error)
        }
      }
      return redirect('/cart')
    }

    // Get shipping methods
    const { eligibleShippingMethods } = await shopApiRequest<{ eligibleShippingMethods: ShippingMethod[] }>(
      ELIGIBLE_SHIPPING_METHODS,
      undefined,
      request
    )

    // Get payment methods
    const { eligiblePaymentMethods } = await shopApiRequest<{ eligiblePaymentMethods: PaymentMethod[] }>(
      ELIGIBLE_PAYMENT_METHODS,
      undefined,
      request
    )

    return {
      activeOrder,
      completedOrder: null,
      upsellProducts: [],
      customerName: '',
      shippingMethods: eligibleShippingMethods,
      paymentMethods: eligiblePaymentMethods,
      hasCustomer: !!activeOrder.customer
    }
  } catch (error) {
    console.error('Failed to load checkout:', error)
    return redirect('/cart')
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get("_action") as string

  try {
    if (action === "set-customer") {
      // Check if customer is already set on the order
      const { activeOrder } = await shopApiRequest<{ activeOrder: { customer?: { id: string } } }>(GET_ACTIVE_ORDER, undefined, request)
      
      if (activeOrder?.customer) {
        // Customer already exists, skip to shipping
        return { success: true, step: 'shipping' }
      }

      try {
        // Only set customer if not already logged in
        const result = await shopApiRequest<{ setCustomerForOrder: { errorCode?: string; message?: string } | unknown }>(SET_CUSTOMER_FOR_ORDER, {
          input: {
            emailAddress: formData.get("emailAddress"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName")
          }
        }, request)

        const customerResult = result.setCustomerForOrder as { errorCode?: string; message?: string } | unknown
        if (customerResult && typeof customerResult === 'object' && 'errorCode' in customerResult) {
          const errorResult = customerResult as { errorCode: string; message?: string }
          // If error is about already being logged in, just proceed to shipping
          if (errorResult.errorCode === 'ALREADY_LOGGED_IN' || errorResult.message?.includes('already logged in')) {
            return { success: true, step: 'shipping' }
          }
          return { error: errorResult.message || 'Failed to set customer' }
        }

        return { success: true, step: 'shipping' }
      } catch (error) {
        // If the GraphQL request itself fails due to being logged in, continue anyway
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('already logged in') || errorMessage.includes('ALREADY_LOGGED_IN')) {
          return { success: true, step: 'shipping' }
        }
        return { error: 'Failed to set customer information' }
      }
    }

    if (action === "set-shipping-address") {
      const addressInput = {
        fullName: formData.get("fullName"),
        streetLine1: formData.get("streetLine1"),
        streetLine2: formData.get("streetLine2"),
        city: formData.get("city"),
        province: formData.get("province"),
        postalCode: formData.get("postalCode"),
        countryCode: formData.get("countryCode"),
        phoneNumber: formData.get("phoneNumber")
      }

      console.log('Setting shipping address:', addressInput)

      const result = await shopApiRequest<{ setOrderShippingAddress: { errorCode?: string; message?: string } | unknown }>(SET_ORDER_SHIPPING_ADDRESS, {
        input: addressInput
      }, request)

      const addressResult = result.setOrderShippingAddress as { errorCode?: string; message?: string } | unknown
      if (addressResult && typeof addressResult === 'object' && 'errorCode' in addressResult) {
        const errorResult = addressResult as { errorCode: string; message?: string }
        console.log('Shipping address error:', errorResult)
        return { error: errorResult.message || 'Failed to set shipping address' }
      }

      console.log('Shipping address set successfully')
      return { success: true, step: 'shipping-method' }
    }

    if (action === "set-shipping-method") {
      const shippingMethodId = formData.get("shippingMethodId") as string
      console.log('Setting shipping method:', shippingMethodId)

      const result = await shopApiRequest<{ setOrderShippingMethod: { errorCode?: string; message?: string } | unknown }>(SET_ORDER_SHIPPING_METHOD, {
        shippingMethodId: [shippingMethodId]
      }, request)

      const methodResult = result.setOrderShippingMethod as { errorCode?: string; message?: string } | unknown
      if (methodResult && typeof methodResult === 'object' && 'errorCode' in methodResult) {
        const errorResult = methodResult as { errorCode: string; message?: string }
        console.log('Shipping method error:', errorResult)
        return { error: errorResult.message || 'Failed to set shipping method' }
      }

      console.log('Shipping method set successfully')
      return { success: true, step: 'payment' }
    }


    if (action === "add-payment") {
      try {
        // First, verify we still have an active order with all required data
        const { activeOrder: currentOrder } = await shopApiRequest<{ 
          activeOrder: { 
            id: string; 
            code: string; 
            state: string; 
            totalWithTax?: number;
            shippingAddress?: { 
              fullName?: string;
              streetLine1: string;
              streetLine2?: string;
              city?: string;
              province?: string;
              postalCode?: string;
              countryCode?: string;
              phoneNumber?: string;
            };
            shippingLines?: { shippingMethod: { id: string } }[];
            customer?: { id: string };
          } | null 
        }>(
          GET_ACTIVE_ORDER,
          undefined,
          request
        )

        if (!currentOrder) {
          return { error: "No active order found. Please start your checkout again." }
        }

        // Log comprehensive order details for debugging
        console.log('Order details before payment:', {
          id: currentOrder.id,
          code: currentOrder.code,
          state: currentOrder.state,
          totalWithTax: currentOrder.totalWithTax,
          hasCustomer: !!currentOrder.customer,
          customer: currentOrder.customer,
          hasShippingAddress: !!currentOrder.shippingAddress,
          shippingAddress: currentOrder.shippingAddress,
          hasShippingLines: !!currentOrder.shippingLines,
          shippingLinesCount: currentOrder.shippingLines?.length || 0,
          shippingLines: currentOrder.shippingLines
        })

        // Validate prerequisites for ArrangingPayment transition
        if (!currentOrder.shippingAddress?.streetLine1) {
          return { error: "Shipping address is incomplete. Please go back and complete the shipping address." }
        }

        if (!currentOrder.shippingLines || currentOrder.shippingLines.length === 0) {
          return { error: "No shipping method selected. Please go back and select a shipping method." }
        }

        console.log('Order validation passed, current state:', currentOrder.state)

        // Transition to ArrangingPayment if still in AddingItems state
        if (currentOrder.state === "AddingItems") {
          console.log('Transitioning from AddingItems to ArrangingPayment...')
          
          // First, ensure billing address is set (use shipping address as billing address)
          try {
            console.log('Setting billing address same as shipping address...')
            const billingResult = await shopApiRequest<{ setOrderBillingAddress: { errorCode?: string; message?: string } | unknown }>(
              SET_ORDER_BILLING_ADDRESS,
              {
                input: {
                  fullName: currentOrder.shippingAddress?.fullName || "Customer",
                  streetLine1: currentOrder.shippingAddress?.streetLine1 || "",
                  streetLine2: currentOrder.shippingAddress?.streetLine2 || "",
                  city: currentOrder.shippingAddress?.city || "",
                  province: currentOrder.shippingAddress?.province || "",
                  postalCode: currentOrder.shippingAddress?.postalCode || "",
                  countryCode: currentOrder.shippingAddress?.countryCode || "US",
                  phoneNumber: currentOrder.shippingAddress?.phoneNumber || ""
                }
              },
              request
            )

            const billingAddress = billingResult.setOrderBillingAddress as { errorCode?: string; message?: string } | unknown
            if (billingAddress && typeof billingAddress === 'object' && 'errorCode' in billingAddress) {
              const billingError = billingAddress as { errorCode: string; message?: string }
              console.log('Billing address error:', billingError)
              // Continue anyway - billing address might be optional
            } else {
              console.log('Billing address set successfully')
            }
          } catch (error) {
            console.log('Billing address setting failed, continuing anyway:', error)
          }

          // Now attempt the state transition
          try {
            const transitionResult = await shopApiRequest<{ transitionOrderToState: { errorCode?: string; message?: string } | unknown }>(
              TRANSITION_ORDER_TO_STATE,
              { state: "ArrangingPayment" },
              request
            )

            const transition = transitionResult.transitionOrderToState as { errorCode?: string; message?: string } | unknown
            if (transition && typeof transition === 'object' && 'errorCode' in transition) {
              const transitionError = transition as { errorCode: string; message?: string }
              console.log('Transition error:', transitionError)
              return { error: `Cannot process payment: ${transitionError.message || 'Failed to prepare order for payment'}` }
            }
            console.log('Successfully transitioned to ArrangingPayment')
          } catch (error) {
            console.error('Transition failed:', error)
            return { error: 'Failed to prepare order for payment. Please try again.' }
          }
        } else if (!["ArrangingPayment", "PaymentAuthorized", "PaymentSettled"].includes(currentOrder.state)) {
          return { error: `Order is in invalid state for payment: ${currentOrder.state}` }
        }

        console.log('Order ready for payment processing...')

        // For demo purposes, we'll use a simple payment method
        const result = await shopApiRequest<{ addPaymentToOrder: { errorCode?: string; message?: string; paymentErrorMessage?: string } | unknown }>(
          ADD_PAYMENT_TO_ORDER,
          {
            input: {
              method: formData.get("paymentMethod") as string,
              metadata: {
                // This would contain real payment data in production
                demo: true,
                amount: currentOrder.totalWithTax || 0
              }
            }
          },
          request
        )

        const paymentResult = result.addPaymentToOrder as { errorCode?: string; message?: string; paymentErrorMessage?: string } | unknown
        if (paymentResult && typeof paymentResult === 'object' && 'errorCode' in paymentResult) {
          const errorResult = paymentResult as { errorCode: string; message?: string; paymentErrorMessage?: string }
          return { 
            error: errorResult.paymentErrorMessage || errorResult.message || `Payment failed: ${errorResult.errorCode}`
          }
        }

        // Fetch upsell products and customer info for thank-you step
        const { products } = await shopApiRequest<{ products: { items: Product[] } }>(
          GET_PRODUCTS,
          { options: { take: 6, sort: { createdAt: "DESC" } } },
          request
        )

        // Get final order state
        const { orderByCode } = await shopApiRequest<{ orderByCode: any }>(GET_ORDER_BY_CODE, { code: currentOrder.code }, request)
        
        const orderProductNames = orderByCode?.lines?.map((line: any) => line.productVariant.product.name) || []
        const upsellProducts = products.items.filter(product => 
          !orderProductNames.includes(product.name)
        ).slice(0, 3)

        const customerName = orderByCode?.customer?.firstName || orderByCode?.customer?.emailAddress?.split('@')[0] || 'Valued Customer'

        // After successful payment, move to thank-you step
        return { 
          success: true, 
          step: 'thank-you', 
          orderCode: currentOrder.code,
          completedOrder: orderByCode,
          upsellProducts,
          customerName
        }
      } catch (error) {
        console.error('Payment processing failed:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('no active Order')) {
          return { error: "Your session has expired. Please start your checkout again." }
        }
        return { error: "Payment processing failed. Please try again." }
      }
    }

    if (action === "add-upsell") {
      const productVariantId = formData.get("productVariantId") as string
      
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
  } catch (error) {
    console.error('Checkout action failed:', error)
    return { error: "Action failed. Please try again." }
  }
}

export default function Checkout() {
  const { activeOrder, completedOrder, upsellProducts, customerName, shippingMethods, paymentMethods, hasCustomer } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  
  // Determine initial step based on whether customer is already set
  const initialStep = hasCustomer ? 'shipping' : 'customer'
  const [currentStep, setCurrentStep] = useState(initialStep)

  const isSubmitting = navigation.state === "submitting"

  // Update step based on action results
  if (actionData?.success && actionData.step && actionData.step !== currentStep) {
    setCurrentStep(actionData.step)
  }

  const steps = [
    ...(hasCustomer ? [] : [{ id: 'customer', name: 'Customer Info', icon: '👤' }]),
    { id: 'shipping', name: 'Shipping Address', icon: '🚚' },
    { id: 'shipping-method', name: 'Shipping Method', icon: '📦' },
    { id: 'payment', name: 'Payment', icon: '💰' },
    { id: 'thank-you', name: 'Thank You', icon: '🎉' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Checkout
            </h1>
            <p className="text-xl text-neutral-600">
              Complete your order in a few simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 overflow-x-auto">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index
                
                return (
                  <div key={step.id} className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap ${
                    isActive ? 'bg-brand-100 text-brand-800' : 
                    isCompleted ? 'bg-success-100 text-success-800' : 
                    'bg-neutral-100 text-neutral-600'
                  }`}>
                    <span className="text-lg">{step.icon}</span>
                    <span className="font-medium">{step.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Error Messages */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {/* Customer Information Step */}
              {currentStep === 'customer' && !hasCustomer && (
                <CustomerForm isSubmitting={isSubmitting} />
              )}

              {/* Shipping Address Step */}
              {currentStep === 'shipping' && (
                <ShippingAddressForm isSubmitting={isSubmitting} />
              )}

              {/* Shipping Method Step */}
              {currentStep === 'shipping-method' && (
                <ShippingMethodForm shippingMethods={shippingMethods} isSubmitting={isSubmitting} />
              )}


              {/* Payment Step */}
              {currentStep === 'payment' && (
                <PaymentForm paymentMethods={paymentMethods} isSubmitting={isSubmitting} />
              )}

              {/* Thank You Step */}
              {currentStep === 'thank-you' && (
                <ThankYouStep 
                  order={actionData?.completedOrder || completedOrder || activeOrder} 
                  upsellProducts={actionData?.upsellProducts || upsellProducts}
                  customerName={actionData?.customerName || customerName}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          {currentStep !== 'thank-you' && (
            <div className="lg:col-span-1">
              <OrderSummary activeOrder={activeOrder} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CustomerForm({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Customer Information</h2>
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="set-customer" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="emailAddress" className="block text-sm font-medium text-neutral-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="emailAddress"
            name="emailAddress"
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Shipping'}
        </button>
      </Form>
    </div>
  )
}

function ShippingAddressForm({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Shipping Address</h2>
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="set-shipping-address" />
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="streetLine1" className="block text-sm font-medium text-neutral-700 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            id="streetLine1"
            name="streetLine1"
            required
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="streetLine2" className="block text-sm font-medium text-neutral-700 mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            id="streetLine2"
            name="streetLine2"
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-neutral-700 mb-2">
              State/Province
            </label>
            <input
              type="text"
              id="province"
              name="province"
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="countryCode" className="block text-sm font-medium text-neutral-700 mb-2">
              Country *
            </label>
            <select
              id="countryCode"
              name="countryCode"
              required
              defaultValue="MN"
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="MN">Mongolia</option>
              <option value="CN">China</option>
              <option value="RU">Russia</option>
              <option value="US">United States</option>
            </select>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Shipping Method'}
        </button>
      </Form>
    </div>
  )
}

function ShippingMethodForm({ shippingMethods, isSubmitting }: { shippingMethods: ShippingMethod[], isSubmitting: boolean }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Shipping Method</h2>
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="set-shipping-method" />
        
        <div className="space-y-4">
          {shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors">
              <label className="flex items-center w-full cursor-pointer">
                <input
                  type="radio"
                  name="shippingMethodId"
                  value={method.id}
                  required
                  className="mr-4 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{method.name}</h3>
                      <p className="text-neutral-600 text-sm">{method.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{formatPrice(method.priceWithTax)}</p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-neutral-800 hover:to-neutral-700 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Processing...' : 'Continue to Payment'}
        </button>
      </Form>
    </div>
  )
}


function PaymentForm({ paymentMethods, isSubmitting }: { paymentMethods: PaymentMethod[], isSubmitting: boolean }) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Payment</h2>
      <Form method="post" className="space-y-6">
        <input type="hidden" name="_action" value="add-payment" />
        
        <div className="space-y-4">
          {paymentMethods.filter(method => method.isEligible).map((method) => (
            <div key={method.id} className="flex items-center p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors">
              <label className="flex items-center w-full cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.code}
                  required
                  className="mr-4 h-4 w-4 text-brand-600 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{method.name}</h3>
                  <p className="text-neutral-600 text-sm">{method.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl">
          <p className="text-sm text-neutral-600">
            <strong>Demo Note:</strong> This is a demo checkout. No real payment will be processed.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-success-600 to-success-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-success-500 hover:to-success-400 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Processing Payment...' : 'Complete Order'}
        </button>
      </Form>
    </div>
  )
}

function ThankYouStep({ order, upsellProducts, customerName, isSubmitting }: { 
  order: any, 
  upsellProducts: Product[], 
  customerName: string,
  isSubmitting: boolean 
}) {
  if (!order) return null

  return (
    <div className="p-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-success-500 to-success-600 rounded-full mb-8 shadow-large">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
          Thank You, {customerName}! 🎉
        </h1>
        <p className="text-xl text-neutral-600 mb-4">
          Your order has been confirmed and is being processed
        </p>
        <p className="text-lg text-neutral-500">
          Order #{order.code} • {order.totalQuantity} items • {formatPrice(order.totalWithTax + (order.shippingWithTax || 0))}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-50 rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Your Order Details</h2>
            
            <div className="space-y-4">
              {order.lines.map((line: any, index: number) => (
                <div key={line.id} className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-soft">
                  <div className="flex-shrink-0">
                    {line.productVariant.product.featuredAsset ? (
                      <img
                        src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                        alt={line.productVariant.product.name}
                        className="w-16 h-16 object-cover rounded-xl"
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

          {/* Next Steps */}
          <div className="bg-neutral-50 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Happens Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-brand-50 rounded-xl">
                <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Email Confirmation</h4>
                <p className="text-sm text-neutral-600">Check your email for order details</p>
              </div>
              
              <div className="text-center p-4 bg-warning-50 rounded-xl">
                <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-neutral-900 mb-2">Processing</h4>
                <p className="text-sm text-neutral-600">We&apos;re preparing your order</p>
              </div>
              
              <div className="text-center p-4 bg-success-50 rounded-xl">
                <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
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
                  <div key={product.id} className="border border-neutral-200 rounded-xl p-4 hover:border-brand-300 transition-colors duration-200">
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
    </div>
  )
}

function OrderSummary({ activeOrder }: { activeOrder: any }) {
  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
          <h3 className="text-2xl font-bold text-neutral-900">Order Summary</h3>
        </div>

        <div className="p-8 space-y-6">
          {/* Items */}
          <div className="space-y-4">
            {activeOrder.lines.map((line: any) => (
              <div key={line.id} className="flex items-center space-x-4">
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
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-900 truncate">
                    {line.productVariant.product.name}
                  </h4>
                  <p className="text-sm text-neutral-600">Qty: {line.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">{formatPrice(line.linePriceWithTax)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Subtotal</span>
              <span className="font-bold text-neutral-900">{formatPrice(activeOrder.total)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Shipping</span>
              <span className="font-bold text-neutral-900">
                {formatPrice(activeOrder?.shippingWithTax || 0)}
              </span>
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-neutral-900">Total</span>
                <span className="text-2xl font-bold text-neutral-900">
                  {formatPrice(activeOrder.totalWithTax + (activeOrder.shippingWithTax || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}