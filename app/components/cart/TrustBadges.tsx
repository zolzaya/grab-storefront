import React from "react"

const trustBadges = [
  {
    icon: (
      <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "30-Day Returns",
    description: "Hassle-free returns",
    bg: "bg-success-100"
  },
  {
    icon: (
      <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: "Fast Shipping",
    description: "2-3 business days",
    bg: "bg-brand-100"
  },
  {
    icon: (
      <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Checkout",
    description: "SSL encrypted",
    bg: "bg-warning-100"
  }
]

export function TrustBadges() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <h4 className="text-lg font-bold text-neutral-900 mb-4 text-center">Why Shop With Us?</h4>
      <div className="space-y-4">
        {trustBadges.map((badge, idx) => (
          <div className="flex items-center" key={idx}>
            <div className={`w-10 h-10 ${badge.bg} rounded-xl flex items-center justify-center mr-4 flex-shrink-0`}>
              {badge.icon}
            </div>
            <div>
              <p className="font-semibold text-neutral-900">{badge.title}</p>
              <p className="text-sm text-neutral-600">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
