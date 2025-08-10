import { useCallback, useEffect, useState } from "react"
import type { PriceRange } from "~/lib/types"

interface PriceRangeFilterProps {
  priceRange?: PriceRange
  currentRange?: PriceRange
  onChange: (range?: PriceRange) => void
  className?: string
}

export function PriceRangeFilter({
  priceRange,
  currentRange,
  onChange,
  className = ""
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(currentRange?.min?.toString() || "")
  const [localMax, setLocalMax] = useState(currentRange?.max?.toString() || "")
  const [sliderMin, setSliderMin] = useState(currentRange?.min || priceRange?.min || 0)
  const [sliderMax, setSliderMax] = useState(currentRange?.max || priceRange?.max || 1000)

  const rangeMin = priceRange?.min || 0
  const rangeMax = priceRange?.max || 1000

  // Update local state when currentRange changes
  useEffect(() => {
    setLocalMin(currentRange?.min?.toString() || "")
    setLocalMax(currentRange?.max?.toString() || "")
    setSliderMin(currentRange?.min || rangeMin)
    setSliderMax(currentRange?.max || rangeMax)
  }, [currentRange, rangeMin, rangeMax])

  const handleApply = useCallback(() => {
    const min = localMin ? parseFloat(localMin) : undefined
    const max = localMax ? parseFloat(localMax) : undefined

    if (min !== undefined || max !== undefined) {
      onChange({
        min: min || rangeMin,
        max: max || rangeMax
      })
    } else {
      onChange(undefined)
    }
  }, [localMin, localMax, onChange, rangeMin, rangeMax])

  const handleClear = useCallback(() => {
    setLocalMin("")
    setLocalMax("")
    setSliderMin(rangeMin)
    setSliderMax(rangeMax)
    onChange(undefined)
  }, [onChange, rangeMin, rangeMax])

  // Calculate slider track fill percentage
  const getSliderStyle = useCallback(() => {
    const minPercent = ((sliderMin - rangeMin) / (rangeMax - rangeMin)) * 100
    const maxPercent = ((sliderMax - rangeMin) / (rangeMax - rangeMin)) * 100

    return {
      background: `linear-gradient(to right, 
        #e5e7eb 0%, 
        #e5e7eb ${minPercent}%, 
        #3b82f6 ${minPercent}%, 
        #3b82f6 ${maxPercent}%, 
        #e5e7eb ${maxPercent}%, 
        #e5e7eb 100%)`
    }
  }, [sliderMin, sliderMax, rangeMin, rangeMax])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Price Ranges */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-3">Quick Ranges</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Under $50", min: rangeMin, max: 50 },
            { label: "$50 - $100", min: 50, max: 100 },
            { label: "$100 - $200", min: 100, max: 200 },
            { label: "$200 - $500", min: 200, max: 500 },
            { label: "$500 - $1000", min: 500, max: 1000 },
            { label: "Over $1000", min: 1000, max: rangeMax },
          ].filter(range => range.min <= rangeMax && range.max >= rangeMin).map((range) => (
            <button
              key={`${range.min}-${range.max}`}
              onClick={() => {
                setSliderMin(range.min)
                setSliderMax(range.max)
                setLocalMin(range.min.toString())
                setLocalMax(range.max.toString())
                onChange({ min: range.min, max: range.max })
              }}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors duration-200 ${currentRange?.min === range.min && currentRange?.max === range.max
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          background: #2563eb;
          transform: scale(1.1);
        }
        
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  )
}