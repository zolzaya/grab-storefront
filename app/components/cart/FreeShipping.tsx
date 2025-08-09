
export function FreeShippingBanner() {
  return (
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
  )
}