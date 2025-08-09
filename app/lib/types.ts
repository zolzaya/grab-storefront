export interface Asset {
  id: string
  preview: string
  source?: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  priceWithTax: number
  sku: string
  stockLevel: string
  featuredAsset?: Asset
  options?: ProductOption[]
}

export interface ProductOption {
  id: string
  name: string
  code: string
}

export interface ProductOptionGroup {
  id: string
  name: string
  code: string
  options: ProductOption[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  featuredAsset?: Asset
  assets?: Asset[]
  variants: ProductVariant[]
  optionGroups?: ProductOptionGroup[]
}

export interface ProductList {
  items: Product[]
  totalItems: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string
  featuredAsset?: Asset
  parent?: {
    id: string
    name: string
  }
  children?: Collection[]
  breadcrumbs?: Breadcrumb[]
}

export interface Breadcrumb {
  id: string
  name: string
  slug: string
}

export interface CollectionList {
  items: Collection[]
}

export interface OrderLine {
  id: string
  quantity: number
  linePriceWithTax: number
  productVariant: ProductVariant & {
    product: Product
  }
}

export interface Order {
  id: string
  code: string
  state: string
  total: number
  totalWithTax: number
  totalQuantity: number
  lines: OrderLine[]
  shipping?: number
  shippingWithTax?: number
}

export interface AddItemToOrderResult {
  addItemToOrder: Order | ErrorResult
}

export interface RemoveOrderLineResult {
  removeOrderLine: Order | ErrorResult
}

export interface AdjustOrderLineResult {
  adjustOrderLine: Order | ErrorResult
}

export interface ErrorResult {
  errorCode: string
  message: string
}

export interface ProductListOptions {
  take?: number
  skip?: number
  sort?: {
    name?: 'ASC' | 'DESC'
    price?: 'ASC' | 'DESC'
    createdAt?: 'ASC' | 'DESC'
  }
  filter?: {
    name?: {
      contains?: string
    }
  }
}

export interface CollectionListOptions {
  take?: number
  skip?: number
  filter?: {
    name?: {
      contains?: string
    }
  }
}