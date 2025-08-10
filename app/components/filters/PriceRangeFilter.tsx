import { useState, useCallback, useRef, useEffect } from "react"
import type { PriceRange } from "~/lib/types"

interface PriceRangeFilterProps {
  priceRange?: PriceRange
  currentRange?: PriceRange
  onChange: (range?: PriceRange) => void
  currency?: string
  step?: number
  className?: string
}

export function PriceRangeFilter({
  priceRange,
  currentRange,
  onChange,
  currency = "$",
  step = 10,
  className = ""
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(currentRange?.min?.toString() || "")
  const [localMax, setLocalMax] = useState(currentRange?.max?.toString() || "")
  const [sliderMin, setSliderMin] = useState(currentRange?.min || priceRange?.min || 0)
  const [sliderMax, setSliderMax] = useState(currentRange?.max || priceRange?.max || 1000)
  
  const minInputRef = useRef<HTMLInputElement>(null)
  const maxInputRef = useRef<HTMLInputElement>(null)

  const rangeMin = priceRange?.min || 0
  const rangeMax = priceRange?.max || 1000

  // Update local state when currentRange changes
  useEffect(() => {
    setLocalMin(currentRange?.min?.toString() || "")
    setLocalMax(currentRange?.max?.toString() || "")
    setSliderMin(currentRange?.min || rangeMin)
    setSliderMax(currentRange?.max || rangeMax)
  }, [currentRange, rangeMin, rangeMax])

  const handleMinSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), sliderMax - step)
    setSliderMin(value)
    setLocalMin(value.toString())
  }, [sliderMax, step])

  const handleMaxSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), sliderMin + step)
    setSliderMax(value)
    setLocalMax(value.toString())
  }, [sliderMin, step])

  const handleMinInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalMin(value)
    
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue >= rangeMin && numValue <= rangeMax) {
      setSliderMin(Math.min(numValue, sliderMax - step))
    }
  }, [rangeMin, rangeMax, sliderMax, step])

  const handleMaxInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalMax(value)
    
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue >= rangeMin && numValue <= rangeMax) {
      setSliderMax(Math.max(numValue, sliderMin + step))
    }
  }, [rangeMin, rangeMax, sliderMin, step])

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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply()
    }
  }, [handleApply])

  const formatPrice = useCallback((price: number) => {
    return `${currency}${price.toLocaleString()}`
  }, [currency])

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
      {/* Current Range Display */}
      <div className="text-center">
        <div className="text-lg font-semibold text-neutral-900">
          {formatPrice(sliderMin)} - {formatPrice(sliderMax)}
        </div>
        <div className="text-sm text-neutral-500">
          of {formatPrice(rangeMin)} - {formatPrice(rangeMax)}
        </div>
      </div>

      {/* Dual Range Slider */}
      <div className="relative">
        <div className="relative h-2 bg-neutral-200 rounded-full" style={getSliderStyle()}>
          {/* Min Range Slider */}
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            step={step}
            value={sliderMin}
            onChange={handleMinSliderChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
            style={{ zIndex: 1 }}
          />
          
          {/* Max Range Slider */}
          <input
            type="range"
            min={rangeMin}
            max={rangeMax}
            step={step}
            value={sliderMax}
            onChange={handleMaxSliderChange}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
            style={{ zIndex: 2 }}
          />
        </div>
        
        {/* Range Labels */}
        <div className="flex justify-between mt-2 text-xs text-neutral-500">
          <span>{formatPrice(rangeMin)}</span>
          <span>{formatPrice(rangeMax)}</span>
        </div>
      </div>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price-min" className="block text-sm font-medium text-neutral-700 mb-2">
            Minimum Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm">
              {currency}
            </span>
            <input
              ref={minInputRef}
              id="price-min"
              type="number"
              value={localMin}
              onChange={handleMinInputChange}
              onKeyDown={handleKeyDown}
              placeholder={rangeMin.toString()}
              min={rangeMin}
              max={rangeMax}
              step={step}
              className="w-full pl-8 pr-3 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-colors duration-200"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="price-max" className="block text-sm font-medium text-neutral-700 mb-2">
            Maximum Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 text-sm">
              {currency}
            </span>
            <input
              ref={maxInputRef}
              id="price-max"
              type="number"
              value={localMax}
              onChange={handleMaxInputChange}
              onKeyDown={handleKeyDown}
              placeholder={rangeMax.toString()}
              min={rangeMin}
              max={rangeMax}
              step={step}
              className="w-full pl-8 pr-3 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-colors duration-200"
            />
          </div>
        </div>
      </div>

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
              className={`px-3 py-2 text-sm border rounded-lg transition-colors duration-200 ${
                currentRange?.min === range.min && currentRange?.max === range.max
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
      <div className="flex space-x-3 pt-2">
        <button
          onClick={handleApply}
          disabled={!localMin && !localMax}
          className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply Filter
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-3 text-neutral-600 border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors duration-200 text-sm font-medium"
        >
          Clear
        </button>
      </div>

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