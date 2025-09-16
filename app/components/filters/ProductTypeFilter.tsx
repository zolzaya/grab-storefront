export interface ProductTypeOption {
  id: string
  name: string
  productCount: number
  description?: string
}

interface ProductTypeFilterProps {
  options: ProductTypeOption[]
  selectedTypes: string[]
  onTypeToggle: (typeId: string) => void
  className?: string
  title?: string
}

export default function ProductTypeFilter({
  options,
  selectedTypes,
  onTypeToggle,
  className = '',
  title = 'Төрөл'
}: ProductTypeFilterProps) {
  return (
    <div className={`space-y-4 ${className}`} role="group" aria-labelledby="product-type-filter-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 id="product-type-filter-heading" className="text-sm font-medium text-gray-900">
          {title}
        </h3>
        {selectedTypes.length > 0 && (
          <button
            onClick={() => selectedTypes.forEach(id => onTypeToggle(id))}
            className="text-xs text-red-600 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
            aria-label={`Clear all selected product types (${selectedTypes.length} selected)`}
          >
            Цэвэрлэх
          </button>
        )}
      </div>

      {/* Checkbox Options */}
      <div className="space-y-3" role="group" aria-label="Product type options">
        {options.map((option) => {
          const isSelected = selectedTypes.includes(option.id)

          return (
            <label
              key={option.id}
              className="flex items-center group cursor-pointer focus-within:ring-2 focus-within:ring-red-500 focus-within:ring-opacity-50 rounded"
            >
              {/* Custom Checkbox */}
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTypeToggle(option.id)}
                  className="sr-only"
                  aria-describedby={option.description ? `${option.id}-description` : undefined}
                  aria-label={`${option.name} (${option.productCount} products)`}
                />
                <div
                  className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                    isSelected
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white border-gray-300 group-hover:border-gray-400'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Label Content */}
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm transition-colors ${
                      isSelected
                        ? 'text-red-700 font-medium'
                        : 'text-gray-700 group-hover:text-gray-900'
                    }`}
                  >
                    {option.name}
                  </span>
                  <span
                    className={`text-xs ml-2 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    ({option.productCount.toLocaleString()})
                  </span>
                </div>

                {option.description && (
                  <p
                    id={`${option.id}-description`}
                    className="text-xs text-gray-500 mt-0.5 group-hover:text-gray-600"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          )
        })}
      </div>

      {/* Selected Summary */}
      {selectedTypes.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedTypes.length} төрөл сонгосон
            </span>
            <button
              onClick={() => selectedTypes.forEach(id => onTypeToggle(id))}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Бүгдийг цэвэрлэх
            </button>
          </div>
        </div>
      )}
    </div>
  )
}