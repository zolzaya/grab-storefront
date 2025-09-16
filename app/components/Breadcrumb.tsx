import { Link } from '@remix-run/react'
import type { Breadcrumb as BreadcrumbType } from '~/lib/types'

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbType[]
  currentPage?: string
}

export default function Breadcrumb({ breadcrumbs, currentPage }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol
        itemScope
        itemType="https://schema.org/BreadcrumbList"
        className="flex items-center space-x-2 text-sm text-gray-600"
      >
        {/* Home link */}
        <li
          itemProp="itemListElement"
          itemScope
          itemType="https://schema.org/ListItem"
        >
          <Link
            to="/"
            itemProp="item"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span itemProp="name">Нүүр</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.id}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center"
          >
            <span className="mx-2 text-gray-400">›</span>
            <Link
              to={`/collections/${breadcrumb.slug}`}
              itemProp="item"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span itemProp="name">{breadcrumb.name}</span>
            </Link>
            <meta itemProp="position" content={String(index + 2)} />
          </li>
        ))}

        {/* Current page */}
        {currentPage && (
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center"
          >
            <span className="mx-2 text-gray-400">›</span>
            <span
              itemProp="name"
              className="text-gray-900 font-medium"
              aria-current="page"
            >
              {currentPage}
            </span>
            <meta itemProp="position" content={String(breadcrumbs.length + 2)} />
          </li>
        )}
      </ol>
    </nav>
  )
}