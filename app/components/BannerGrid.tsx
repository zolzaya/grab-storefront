import { Link } from '@remix-run/react'

interface BannerItem {
  id: string
  title: string
  subtitle?: string
  ctaText: string
  ctaLink: string
  backgroundGradient: string
  textColor: string
  size: 'small' | 'medium' | 'large' | 'wide'
  textPosition?: 'left' | 'center' | 'right'
}

const bannerItems: BannerItem[] = [
  {
    id: '1',
    title: 'Fashion Week Pop-Up in NYC!',
    ctaText: 'Get details',
    ctaLink: '/collections/fashion',
    backgroundGradient: 'from-gray-100 to-gray-200',
    textColor: 'text-gray-900',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '2',
    title: 'Epic savings, from $14',
    subtitle: 'The Beauty Event',
    ctaText: 'Shop now',
    ctaLink: '/collections/beauty',
    backgroundGradient: 'from-pink-200 to-pink-300',
    textColor: 'text-gray-900',
    size: 'large',
    textPosition: 'left'
  },
  {
    id: '3',
    title: 'New: David 28g protein bars',
    ctaText: 'Shop now',
    ctaLink: '/collections/nutrition',
    backgroundGradient: 'from-blue-100 to-blue-200',
    textColor: 'text-gray-900',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '4',
    title: 'Get up to 30% off—it\'s LEGO® Month!',
    ctaText: 'Shop now',
    ctaLink: '/collections/toys',
    backgroundGradient: 'from-yellow-100 to-yellow-200',
    textColor: 'text-gray-900',
    size: 'medium',
    textPosition: 'left'
  },
  {
    id: '7',
    title: 'They\'re here: Lemme, Nutrafol & Ritual',
    ctaText: 'Shop now',
    ctaLink: '/collections/wellness',
    backgroundGradient: 'from-purple-100 to-purple-200',
    textColor: 'text-gray-900',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '5',
    title: 'New Scoop, only at Walmart',
    ctaText: 'Shop now',
    ctaLink: '/collections/fashion',
    backgroundGradient: 'from-gray-800 to-gray-900',
    textColor: 'text-white',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '6',
    title: 'Up to 45% off',
    subtitle: 'Flash Deals',
    ctaText: 'Shop now',
    ctaLink: '/collections/deals',
    backgroundGradient: 'from-yellow-300 to-yellow-400',
    textColor: 'text-gray-900',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '8',
    title: 'The dress edit',
    ctaText: 'Shop now',
    ctaLink: '/collections/dresses',
    backgroundGradient: 'from-rose-100 to-rose-200',
    textColor: 'text-gray-900',
    size: 'medium',
    textPosition: 'left'
  },
  {
    id: '9',
    title: 'All out Pro.',
    subtitle: 'iPhone 17 PRO',
    ctaText: 'Preorder now',
    ctaLink: '/products/iphone-17-pro',
    backgroundGradient: 'from-gray-900 to-black',
    textColor: 'text-white',
    size: 'small',
    textPosition: 'left'
  },
  {
    id: '10',
    title: 'New! Members get to pick with Video Streaming Choice.',
    ctaText: 'Try Walmart+ for free',
    ctaLink: '/membership',
    backgroundGradient: 'from-blue-500 to-blue-600',
    textColor: 'text-white',
    size: 'wide',
    textPosition: 'left'
  }
]

function BannerCard({ item }: { item: BannerItem }) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1 h-48',
    medium: 'col-span-1 row-span-2 h-auto',
    large: 'col-span-2 row-span-2 h-96',
    wide: 'col-span-2 row-span-1 h-48'
  }

  const textPositionClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.backgroundGradient} ${sizeClasses[item.size]} group cursor-pointer transition-transform duration-300 hover:scale-[1.02] shadow-soft hover:shadow-medium`}>
      <Link to={item.ctaLink} className="absolute inset-0 z-10">
        <span className="sr-only">{item.title}</span>
      </Link>

      {/* Placeholder content area */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-16 h-16 bg-gray-400 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Content overlay */}
      <div className={`relative z-20 h-full p-6 flex flex-col justify-between ${textPositionClasses[item.textPosition || 'left']}`}>
        <div className="space-y-2">
          <h3 className={`font-bold text-lg leading-tight ${item.textColor} group-hover:scale-105 transition-transform duration-200`}>
            {item.title}
          </h3>
          {item.subtitle && (
            <p className={`text-sm opacity-80 ${item.textColor}`}>
              {item.subtitle}
            </p>
          )}
        </div>

        <button className={`inline-flex items-center text-sm font-medium ${item.textColor} underline decoration-2 underline-offset-4 hover:no-underline transition-all duration-200 group-hover:translate-x-1`}>
          {item.ctaText}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function BannerGrid() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-rows-4">
          {bannerItems.map((item) => (
            <BannerCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}