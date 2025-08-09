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

// Checkout-related types
export interface Address {
  id?: string
  fullName?: string
  company?: string
  streetLine1: string
  streetLine2?: string
  city?: string
  province?: string
  postalCode?: string
  countryCode: string
  phoneNumber?: string
  defaultShippingAddress?: boolean
  defaultBillingAddress?: boolean
  customFields?: any
}

export interface CreateAddressInput {
  fullName?: string
  company?: string
  streetLine1: string
  streetLine2?: string
  city?: string
  province?: string
  postalCode?: string
  countryCode: string
  phoneNumber?: string
  defaultShippingAddress?: boolean
  defaultBillingAddress?: boolean
  customFields?: any
}

export interface CreateCustomerInput {
  emailAddress: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  title?: string
}

export interface ShippingMethod {
  id: string
  name: string
  code: string
  description: string
  priceWithTax: number
  metadata?: any
}

export interface PaymentMethod {
  id: string
  name: string
  code: string
  description: string
  isEligible: boolean
  eligibilityMessage?: string
}

export interface PaymentInput {
  method: string
  metadata: any
}

export interface Payment {
  id: string
  method: string
  amount: number
  state: string
  metadata?: any
}

export interface Customer {
  id: string
  firstName?: string
  lastName?: string
  emailAddress: string
  phoneNumber?: string
  title?: string
}

// Extended Order interface with checkout fields
export interface CheckoutOrder extends Order {
  customer?: Customer
  shippingAddress?: Address
  billingAddress?: Address
  shippingLines?: {
    shippingMethod: ShippingMethod
    priceWithTax: number
  }[]
  payments?: Payment[]
}

// Mutation result types
export interface SetCustomerForOrderResult {
  setCustomerForOrder: CheckoutOrder | ErrorResult
}

export interface SetOrderShippingAddressResult {
  setOrderShippingAddress: CheckoutOrder | ErrorResult
}

export interface SetOrderBillingAddressResult {
  setOrderBillingAddress: CheckoutOrder | ErrorResult
}

export interface SetOrderShippingMethodResult {
  setOrderShippingMethod: CheckoutOrder | ErrorResult
}

export interface AddPaymentToOrderResult {
  addPaymentToOrder: CheckoutOrder | PaymentFailedError | PaymentDeclinedError | OrderPaymentStateError
}

export interface TransitionOrderToStateResult {
  transitionOrderToState: CheckoutOrder | OrderStateTransitionError
}

export interface PaymentFailedError {
  errorCode: string
  message: string
  paymentErrorMessage: string
}

export interface PaymentDeclinedError {
  errorCode: string
  message: string
  paymentErrorMessage: string
}

export interface OrderPaymentStateError {
  errorCode: string
  message: string
}

export interface OrderStateTransitionError {
  errorCode: string
  message: string
  transitionError: string
  fromState: string
  toState: string
}