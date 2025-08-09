export function PaymentMethods() {
  return (
    <section>
      <p className="text-sm font-medium text-neutral-700 mb-3 text-center">Secure Payment</p>
      <div className="flex justify-center items-center space-x-3">
        <div className="w-10 h-6 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-600">VISA</span>
        </div>
        <div className="w-10 h-6 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-600">MC</span>
        </div>
        <div className="w-10 h-6 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-600">AMEX</span>
        </div>
        <div className="w-10 h-6 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-600">PP</span>
        </div>
      </div>

    </section>
  )
}
