import { useState } from 'react'
import { Link } from '@remix-run/react'

export interface CategoryNode {
  id: string
  name: string
  slug: string
  productCount: number
  children?: CategoryNode[]
  isActive?: boolean
}

interface CategorySidebarProps {
  categories: CategoryNode[]
  currentCategoryId?: string
  className?: string
}

interface CategoryItemProps {
  category: CategoryNode
  level: number
  currentCategoryId?: string
  onToggle: (categoryId: string) => void
  expandedCategories: Set<string>
}

function CategoryItem({
  category,
  level,
  currentCategoryId,
  onToggle,
  expandedCategories
}: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  const isActive = category.id === currentCategoryId || category.isActive

  // Handle indentation based on level
  const getIndentClass = (level: number) => {
    switch (level) {
      case 0: return ''
      case 1: return 'ml-4'
      case 2: return 'ml-8'
      case 3: return 'ml-12'
      default: return 'ml-16'
    }
  }

  const indentClass = getIndentClass(level)

  return (
    <div className="select-none">
      {/* Category Item */}
      <div className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-red-50 text-red-700 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      } ${indentClass}`}>
        <div className="flex items-center flex-1 min-w-0">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => onToggle(category.id)}
              className="flex-shrink-0 mr-2 p-0.5 rounded hover:bg-gray-200 transition-colors"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : 'rotate-0'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <div className="w-5 mr-2" /> // Spacer for alignment
          )}

          {/* Category Name and Count */}
          <Link
            to={`/collections/${category.slug}`}
            className="flex items-center justify-between flex-1 min-w-0 group"
          >
            <span className={`text-sm truncate group-hover:text-red-600 transition-colors ${
              isActive ? 'font-medium' : 'font-normal'
            }`}>
              {category.name}
            </span>
            <span className={`text-xs ml-2 flex-shrink-0 ${
              isActive ? 'text-red-600' : 'text-gray-500'
            }`}>
              ({category.productCount})
            </span>
          </Link>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              currentCategoryId={currentCategoryId}
              onToggle={onToggle}
              expandedCategories={expandedCategories}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategorySidebar({
  categories,
  currentCategoryId,
  className = ''
}: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['computers', 'gaming', 'home-appliances']) // Pre-expand some categories
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Ангилал</h3>
        <button className="text-xs text-red-600 hover:text-red-700 transition-colors">
          Бүгдийг харах
        </button>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            level={0}
            currentCategoryId={currentCategoryId}
            onToggle={toggleCategory}
            expandedCategories={expandedCategories}
          />
        ))}
      </div>
    </div>
  )
}