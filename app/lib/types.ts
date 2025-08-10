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
  collections: Collection[]
  facetValues: FacetValue[]
  reviewRating?: number
  reviewCount?: number
  onSale?: boolean
  discountPercentage?: number
  tags?: string[]
  customFields?: any
  enabled?: boolean
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
    updatedAt?: 'ASC' | 'DESC'
    reviewRating?: 'ASC' | 'DESC'
    reviewCount?: 'ASC' | 'DESC'
    bestselling?: 'ASC' | 'DESC'
  }
  filter?: {
    name?: {
      contains?: string
      eq?: string
      in?: string[]
    }
    slug?: {
      contains?: string
      eq?: string
      in?: string[]
    }
    description?: {
      contains?: string
    }
    enabled?: {
      eq?: boolean
    }
    facetValueIds?: {
      in?: string[]
    }
    collectionId?: {
      eq?: string
      in?: string[]
    }
    collectionSlug?: {
      eq?: string
      in?: string[]
    }
    priceRange?: {
      min?: number
      max?: number
    }
    stockLevel?: {
      eq?: string
      in?: string[]
    }
    reviewRating?: {
      gte?: number
      lte?: number
    }
    tags?: {
      contains?: string
      in?: string[]
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

// Authentication types
export interface CurrentUser {
  id: string
  identifier: string
  channels: Channel[]
}

export interface Channel {
  id: string
  code: string
  token: string
}

export interface AuthenticationInput {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCustomerInput {
  emailAddress: string
  title?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  password?: string
}

export interface UpdateCustomerInput {
  title?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export interface UpdateAddressInput {
  id: ID
  fullName?: string
  company?: string
  streetLine1?: string
  streetLine2?: string
  city?: string
  province?: string
  countryCode?: string
  phoneNumber?: string
  defaultShippingAddress?: boolean
  defaultBillingAddress?: boolean
}

export interface CustomerAddress {
  id: string
  fullName?: string
  company?: string
  streetLine1: string
  streetLine2?: string
  city?: string
  province?: string
  country: Country
  phoneNumber?: string
  defaultShippingAddress?: boolean
  defaultBillingAddress?: boolean
}

export interface Country {
  id: string
  name: string
  code: string
}

export interface OrderListOptions {
  take?: number
  skip?: number
  sort?: {
    orderPlacedAt?: 'ASC' | 'DESC'
    id?: 'ASC' | 'DESC'
    code?: 'ASC' | 'DESC'
    state?: 'ASC' | 'DESC'
    total?: 'ASC' | 'DESC'
  }
  filter?: {
    state?: {
      eq?: string
      in?: string[]
    }
    orderPlacedAt?: {
      before?: string
      after?: string
    }
  }
}

export interface CustomerOrder {
  id: string
  code: string
  state: string
  orderPlacedAt: string
  total: number
  totalWithTax: number
  totalQuantity: number
  currencyCode: string
  lines: OrderLine[]
  shippingAddress?: CustomerAddress
  payments?: Payment[]
}

export interface CustomerWithOrdersAndAddresses {
  id: string
  emailAddress: string
  addresses?: CustomerAddress[]
  orders?: {
    items: CustomerOrder[]
    totalItems: number
  }
}

// Authentication result types
export interface AuthenticateResult {
  authenticate: CurrentUser | InvalidCredentialsError | NotVerifiedError
}

export interface RegisterResult {
  registerCustomerAccount: Success | MissingPasswordError | PasswordValidationError | NativeAuthStrategyError
}

export interface VerifyAccountResult {
  verifyCustomerAccount: CurrentUser | VerificationTokenInvalidError | VerificationTokenExpiredError | PasswordValidationError | PasswordAlreadySetError | NativeAuthStrategyError
}

export interface RequestPasswordResetResult {
  requestPasswordReset: Success | NativeAuthStrategyError
}

export interface ResetPasswordResult {
  resetPassword: CurrentUser | PasswordResetTokenInvalidError | PasswordResetTokenExpiredError | PasswordValidationError | NativeAuthStrategyError
}

export interface LogoutResult {
  logout: Success
}

export interface UpdateCustomerResult {
  updateCustomer: Customer | ErrorResult
}

export interface UpdateCustomerPasswordResult {
  updateCustomerPassword: Success | InvalidCredentialsError | PasswordValidationError
}

export interface UpdateCustomerEmailResult {
  updateCustomerEmailAddress: Success | InvalidCredentialsError | EmailAddressConflictError | NativeAuthStrategyError
}

// Error types
export interface Success {
  success: boolean
}

export interface InvalidCredentialsError {
  errorCode: string
  message: string
}

export interface NotVerifiedError {
  errorCode: string
  message: string
}

export interface MissingPasswordError {
  errorCode: string
  message: string
}

export interface PasswordValidationError {
  errorCode: string
  message: string
  validationErrorMessage: string
}

export interface NativeAuthStrategyError {
  errorCode: string
  message: string
}

export interface VerificationTokenInvalidError {
  errorCode: string
  message: string
}

export interface VerificationTokenExpiredError {
  errorCode: string
  message: string
}

export interface PasswordAlreadySetError {
  errorCode: string
  message: string
}

export interface PasswordResetTokenInvalidError {
  errorCode: string
  message: string
}

export interface PasswordResetTokenExpiredError {
  errorCode: string
  message: string
}

export interface EmailAddressConflictError {
  errorCode: string
  message: string
}

// Helper type for ID
export type ID = string

// Enhanced product page interfaces

export interface Facet {
  id: string
  name: string
  code: string
  values: FacetValue[]
}

export interface FacetValue {
  id: string
  name: string
  code: string
  facet: {
    id: string
    name: string
    code: string
  }
}

export interface FacetValueResult {
  facetValue: FacetValue
  count: number
}

export interface PriceRange {
  min: number
  max: number
}

export interface FilterState {
  search?: string
  collections?: string[]
  facets?: { [facetCode: string]: string[] }
  priceRange?: PriceRange
  availability?: ('in_stock' | 'out_of_stock' | 'pre_order')[]
  rating?: number
  tags?: string[]
  sort?: string
  page?: number
  limit?: number
}

export interface SortOption {
  value: string
  label: string
  field?: string
  direction?: 'ASC' | 'DESC'
  category?: string
}

export interface SearchInput {
  term?: string
  groupByProduct?: boolean
  facetValueFilters?: Array<{
    and: string[]
  }>
  facetValueIds?: string[]
  facetValueOperator?: 'AND' | 'OR'
  collectionId?: string
  collectionSlug?: string
  skip?: number
  take?: number
  sort?: {
    name?: 'ASC' | 'DESC'
    price?: 'ASC' | 'DESC'
  }
  priceRange?: PriceRange
  inStock?: boolean
}

export interface SearchResult {
  items: SearchResultItem[]
  totalItems: number
  facetValues: FacetValueResult[]
  collections: CollectionResult[]
}

export interface SearchResultItem {
  productId: string
  productName: string
  productAsset?: Asset
  price: PriceRange | SinglePrice
  priceWithTax: PriceRange | SinglePrice
  sku: string
  slug: string
  productVariantId: string
  productVariantName: string
  description: string
  collectionIds: string[]
  facetIds: string[]
  facetValueIds: string[]
  enabled: boolean
  inStock: boolean
}

export interface SinglePrice {
  value: number
}

export interface CollectionResult {
  collection: Collection
  count: number
}

export interface EnhancedProductList extends ProductList {
  facetValues: FacetValueResult[]
}