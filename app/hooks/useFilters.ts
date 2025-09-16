import { useSearchParams } from '@remix-run/react'
import { useCallback, useMemo } from 'react'

export interface FilterState {
  priceMin?: number
  priceMax?: number
  brands?: string[]
  productTypes?: string[]
  sort?: string
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from URL
  const filters = useMemo<FilterState>(() => {
    return {
      priceMin: searchParams.get('priceMin') ? parseInt(searchParams.get('priceMin')!) : undefined,
      priceMax: searchParams.get('priceMax') ? parseInt(searchParams.get('priceMax')!) : undefined,
      brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
      productTypes: searchParams.get('productTypes')?.split(',').filter(Boolean) || [],
      sort: searchParams.get('sort') || undefined,
    }
  }, [searchParams])

  // Update filters in URL
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setSearchParams(prev => {
      const updated = new URLSearchParams(prev)

      // Handle price range
      if (newFilters.priceMin !== undefined) {
        if (newFilters.priceMin > 0) {
          updated.set('priceMin', newFilters.priceMin.toString())
        } else {
          updated.delete('priceMin')
        }
      }

      if (newFilters.priceMax !== undefined) {
        if (newFilters.priceMax > 0) {
          updated.set('priceMax', newFilters.priceMax.toString())
        } else {
          updated.delete('priceMax')
        }
      }

      // Handle brands
      if (newFilters.brands !== undefined) {
        if (newFilters.brands.length > 0) {
          updated.set('brands', newFilters.brands.join(','))
        } else {
          updated.delete('brands')
        }
      }

      // Handle product types
      if (newFilters.productTypes !== undefined) {
        if (newFilters.productTypes.length > 0) {
          updated.set('productTypes', newFilters.productTypes.join(','))
        } else {
          updated.delete('productTypes')
        }
      }

      // Handle sort
      if (newFilters.sort !== undefined) {
        if (newFilters.sort) {
          updated.set('sort', newFilters.sort)
        } else {
          updated.delete('sort')
        }
      }

      return updated
    }, { replace: true })
  }, [setSearchParams])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  // Update price range
  const updatePriceRange = useCallback((min: number, max: number, absoluteMin: number, absoluteMax: number) => {
    updateFilters({
      priceMin: min > absoluteMin ? min : undefined,
      priceMax: max < absoluteMax ? max : undefined,
    })
  }, [updateFilters])

  // Update brands
  const updateBrands = useCallback((brands: string[]) => {
    updateFilters({ brands })
  }, [updateFilters])

  // Update sort
  const updateSort = useCallback((sort: string) => {
    updateFilters({ sort })
  }, [updateFilters])

  // Update product types
  const updateProductTypes = useCallback((productTypes: string[]) => {
    updateFilters({ productTypes })
  }, [updateFilters])

  // Toggle brand selection
  const toggleBrand = useCallback((brandId: string) => {
    const currentBrands = filters.brands || []
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter(id => id !== brandId)
      : [...currentBrands, brandId]
    updateBrands(newBrands)
  }, [filters.brands, updateBrands])

  // Toggle product type selection
  const toggleProductType = useCallback((typeId: string) => {
    const currentTypes = filters.productTypes || []
    const newTypes = currentTypes.includes(typeId)
      ? currentTypes.filter(id => id !== typeId)
      : [...currentTypes, typeId]
    updateProductTypes(newTypes)
  }, [filters.productTypes, updateProductTypes])

  return {
    filters,
    updateFilters,
    updatePriceRange,
    updateBrands,
    updateProductTypes,
    updateSort,
    toggleBrand,
    toggleProductType,
    clearFilters,
  }
}