import { useState, useEffect, useRef } from 'react'

interface PriceRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  step?: number
  className?: string
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1000,
  className = ''
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Format price in Mongolian Tugrik
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mn-MN').format(price) + '₮'
  }

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Calculate percentage for positioning
  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100
  }

  // Handle mouse events for dragging
  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(thumb)
  }

  // Handle mouse move and up events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newValue = Math.round((percentage / 100) * (max - min) + min)

      // Round to nearest step
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      if (isDragging === 'min') {
        const newMin = Math.min(clampedValue, localValue[1] - step)
        setLocalValue([newMin, localValue[1]])
      } else {
        const newMax = Math.max(clampedValue, localValue[0] + step)
        setLocalValue([localValue[0], newMax])
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        onChange(localValue)
        setIsDragging(null)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, localValue, min, max, step, onChange])

  // Handle input field changes
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.max(min, Math.min(parseInt(e.target.value) || min, localValue[1] - step))
    const newValue: [number, number] = [newMin, localValue[1]]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.min(max, Math.max(parseInt(e.target.value) || max, localValue[0] + step))
    const newValue: [number, number] = [localValue[0], newMax]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const minPercentage = getPercentage(localValue[0])
  const maxPercentage = getPercentage(localValue[1])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Price Display */}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">Үнэ</span>
        <span className="text-sm text-gray-600">
          {formatPrice(localValue[0])} - {formatPrice(localValue[1])}
        </span>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-red-500 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min Thumb */}
          <button
            className={`absolute w-5 h-5 -mt-1.5 bg-white border-2 border-red-500 rounded-full shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
              isDragging === 'min' ? 'scale-110' : ''
            }`}
            style={{ left: `${minPercentage}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown('min')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                const newMin = Math.max(min, localValue[0] - step)
                const newValue: [number, number] = [newMin, localValue[1]]
                setLocalValue(newValue)
                onChange(newValue)
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                const newMin = Math.min(localValue[1] - step, localValue[0] + step)
                const newValue: [number, number] = [newMin, localValue[1]]
                setLocalValue(newValue)
                onChange(newValue)
              }
            }}
            aria-label={`Minimum price: ${formatPrice(localValue[0])}. Use arrow keys to adjust.`}
            aria-valuemin={min}
            aria-valuemax={localValue[1] - step}
            aria-valuenow={localValue[0]}
            role="slider"
            tabIndex={0}
            type="button"
          />

          {/* Max Thumb */}
          <button
            className={`absolute w-5 h-5 -mt-1.5 bg-white border-2 border-red-500 rounded-full shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
              isDragging === 'max' ? 'scale-110' : ''
            }`}
            style={{ left: `${maxPercentage}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown('max')}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                const newMax = Math.max(localValue[0] + step, localValue[1] - step)
                const newValue: [number, number] = [localValue[0], newMax]
                setLocalValue(newValue)
                onChange(newValue)
              } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                const newMax = Math.min(max, localValue[1] + step)
                const newValue: [number, number] = [localValue[0], newMax]
                setLocalValue(newValue)
                onChange(newValue)
              }
            }}
            aria-label={`Maximum price: ${formatPrice(localValue[1])}. Use arrow keys to adjust.`}
            aria-valuemin={localValue[0] + step}
            aria-valuemax={max}
            aria-valuenow={localValue[1]}
            role="slider"
            tabIndex={0}
            type="button"
          />
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Хамгийн бага
          </label>
          <input
            type="number"
            value={localValue[0]}
            onChange={handleMinInputChange}
            min={min}
            max={localValue[1] - step}
            step={step}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="0"
          />
        </div>

        <div className="text-gray-400 mt-6">—</div>

        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Хамгийн их
          </label>
          <input
            type="number"
            value={localValue[1]}
            onChange={handleMaxInputChange}
            min={localValue[0] + step}
            max={max}
            step={step}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="0"
          />
        </div>
      </div>

      {/* Range Display */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  )
}