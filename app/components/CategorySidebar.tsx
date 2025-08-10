import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import type { Collection } from "~/lib/types";

interface CategorySidebarProps {
  collections: Collection[];
  currentCollection?: string;
  onCategoryChange?: (slug: string | null) => void;
  className?: string;
}

interface CategoryNode extends Collection {
  children: CategoryNode[];
}

export function CategorySidebar({ 
  collections, 
  currentCollection, 
  onCategoryChange,
  className = "" 
}: CategorySidebarProps) {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Build category tree structure
  const buildCategoryTree = (collections: Collection[]): CategoryNode[] => {
    const rootCategories = collections.filter(c => 
      c.parent?.name === "__root_collection__" || !c.parent
    );
    
    const buildNode = (collection: Collection): CategoryNode => {
      const children = collections
        .filter(c => c.parent?.id === collection.id)
        .map(buildNode);
      
      return {
        ...collection,
        children
      };
    };

    return rootCategories.map(buildNode);
  };

  const categoryTree = buildCategoryTree(collections);

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleCategoryClick = (slug: string | null) => {
    onCategoryChange?.(slug);
  };

  const renderCategoryItem = (category: CategoryNode, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const isActive = currentCollection === category.slug;
    const indentClass = level > 0 ? `ml-${level * 4}` : '';

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (hasChildren) {
        // If has children, toggle expansion
        toggleExpanded(category.id);
      } else {
        // If no children (leaf node), filter products
        handleCategoryClick(category.slug);
      }
    };

    return (
      <div key={category.id}>
        <div 
          className={`group flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 cursor-pointer ${
            isActive ? 'bg-brand-50 border-l-4 border-brand-500' : ''
          } ${indentClass}`}
          onClick={handleClick}
        >
          {/* Category Icon/Image */}
          <div className="flex-shrink-0 w-8 h-8 mr-3">
            {category.featuredAsset?.preview ? (
              <img
                src={category.featuredAsset.preview}
                alt={category.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
          </div>

          {/* Category Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium truncate ${
                isActive ? 'text-brand-700' : 'text-neutral-900 group-hover:text-neutral-700'
              }`}>
                {category.name}
              </span>
            </div>
          </div>

          {/* Expand/Collapse Icon for categories with children */}
          {hasChildren && (
            <div className="flex-shrink-0 p-1">
              <svg 
                className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                  isExpanded ? 'transform rotate-90' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Children Categories */}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-neutral-100 pl-2">
            {category.children.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-100">
        <h3 className="text-lg font-semibold text-neutral-900">Categories</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <svg 
            className={`w-5 h-5 text-neutral-600 transition-transform duration-200 ${
              isCollapsed ? 'transform rotate-180' : ''
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Categories List */}
      <div className={`${isCollapsed ? 'hidden lg:block' : 'block'}`}>
        {/* All Products Link */}
        <div className="p-4 border-b border-neutral-100">
          <div
            onClick={() => handleCategoryClick(null)}
            className={`flex items-center py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors duration-200 cursor-pointer ${
              !currentCollection ? 'bg-brand-50 border-l-4 border-brand-500' : ''
            }`}
          >
            <div className="flex-shrink-0 w-8 h-8 mr-3">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <span className={`text-sm font-medium ${
              !currentCollection ? 'text-brand-700' : 'text-neutral-900'
            }`}>
              All Products
            </span>
          </div>
        </div>

        {/* Category Tree */}
        <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
          {categoryTree.map(category => renderCategoryItem(category))}
        </div>

      </div>

      {/* Mobile Category Filter Button */}
      <div className="lg:hidden border-t border-neutral-100 p-4">
        <button className="w-full flex items-center justify-center py-2 px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Apply Filter
        </button>
      </div>
    </div>
  );
}

// Category breadcrumbs component
interface CategoryBreadcrumbsProps {
  collections: Collection[];
  currentCollection?: string;
  className?: string;
}

export function CategoryBreadcrumbs({ 
  collections, 
  currentCollection, 
  className = "" 
}: CategoryBreadcrumbsProps) {
  if (!currentCollection) return null;

  const findCategoryPath = (slug: string): Collection[] => {
    const category = collections.find(c => c.slug === slug);
    if (!category) return [];

    const path = [category];
    let current = category;
    
    while (current.parent && current.parent.name !== "__root_collection__") {
      const parent = collections.find(c => c.id === current.parent?.id);
      if (parent) {
        path.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    
    return path;
  };

  const categoryPath = findCategoryPath(currentCollection);

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      <Link 
        to="/products" 
        className="text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        All Products
      </Link>
      
      {categoryPath.map((category, index) => (
        <div key={category.id} className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          {index === categoryPath.length - 1 ? (
            <span className="text-neutral-900 font-medium">{category.name}</span>
          ) : (
            <Link 
              to={`/products?collection=${category.slug}`}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {category.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}