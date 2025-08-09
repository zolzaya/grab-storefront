export const GET_PRODUCTS = `
  query GetProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
        variants {
          id
          name
          price
          priceWithTax
          sku
          stockLevel
          featuredAsset {
            id
            preview
          }
        }
      }
      totalItems
    }
  }
`

export const GET_PRODUCT = `
  query GetProduct($slug: String, $id: ID) {
    product(slug: $slug, id: $id) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
        source
      }
      assets {
        id
        preview
        source
      }
      variants {
        id
        name
        price
        priceWithTax
        sku
        stockLevel
        options {
          id
          name
          code
        }
        featuredAsset {
          id
          preview
          source
        }
      }
      optionGroups {
        id
        name
        code
        options {
          id
          name
          code
        }
      }
    }
  }
`

export const GET_COLLECTIONS = `
  query GetCollections($options: CollectionListOptions) {
    collections(options: $options) {
      items {
        id
        name
        slug
        description
        featuredAsset {
          id
          preview
        }
        parent {
          id
          name
        }
        children {
          id
          name
          slug
        }
      }
    }
  }
`

export const GET_COLLECTION = `
  query GetCollection($slug: String, $id: ID) {
    collection(slug: $slug, id: $id) {
      id
      name
      slug
      description
      featuredAsset {
        id
        preview
        source
      }
      breadcrumbs {
        id
        name
        slug
      }
      children {
        id
        name
        slug
        featuredAsset {
          id
          preview
        }
      }
    }
  }
`

export const GET_ACTIVE_ORDER = `
  query GetActiveOrder {
    activeOrder {
      id
      code
      state
      total
      totalWithTax
      totalQuantity
      lines {
        id
        quantity
        linePriceWithTax
        productVariant {
          id
          name
          price
          priceWithTax
          sku
          product {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
          }
        }
      }
      shippingWithTax
      shipping
    }
  }
`

export const ADD_ITEM_TO_ORDER = `
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      ... on Order {
        id
        code
        state
        total
        totalWithTax
        totalQuantity
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            id
            name
            price
            priceWithTax
            sku
            product {
              id
              name
              slug
              featuredAsset {
                id
                preview
              }
            }
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const REMOVE_ORDER_LINE = `
  mutation RemoveOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ... on Order {
        id
        code
        state
        total
        totalWithTax
        totalQuantity
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            id
            name
            price
            priceWithTax
            sku
            product {
              id
              name
              slug
              featuredAsset {
                id
                preview
              }
            }
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const ADJUST_ORDER_LINE = `
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ... on Order {
        id
        code
        state
        total
        totalWithTax
        totalQuantity
        lines {
          id
          quantity
          linePriceWithTax
          productVariant {
            id
            name
            price
            priceWithTax
            sku
            product {
              id
              name
              slug
              featuredAsset {
                id
                preview
              }
            }
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

// Checkout-related queries and mutations
export const ELIGIBLE_SHIPPING_METHODS = `
  query EligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      code
      description
      priceWithTax
      metadata
    }
  }
`

export const ELIGIBLE_PAYMENT_METHODS = `
  query EligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      name
      code
      description
      isEligible
      eligibilityMessage
    }
  }
`

export const SET_CUSTOMER_FOR_ORDER = `
  mutation SetCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ... on Order {
        id
        code
        customer {
          id
          firstName
          lastName
          emailAddress
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const SET_ORDER_SHIPPING_ADDRESS = `
  mutation SetOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order {
        id
        code
        state
        shippingAddress {
          fullName
          company
          streetLine1
          streetLine2
          city
          province
          postalCode
          countryCode
          phoneNumber
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const SET_ORDER_BILLING_ADDRESS = `
  mutation SetOrderBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      ... on Order {
        id
        code
        state
        billingAddress {
          fullName
          company
          streetLine1
          streetLine2
          city
          province
          postalCode
          countryCode
          phoneNumber
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const SET_ORDER_SHIPPING_METHOD = `
  mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        id
        code
        state
        shipping
        shippingWithTax
        shippingLines {
          shippingMethod {
            id
            name
            description
          }
          priceWithTax
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const ADD_PAYMENT_TO_ORDER = `
  mutation AddPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ... on Order {
        id
        code
        state
        totalWithTax
        payments {
          id
          method
          amount
          state
          metadata
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
      ... on PaymentFailedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on PaymentDeclinedError {
        errorCode
        message
        paymentErrorMessage
      }
      ... on OrderPaymentStateError {
        errorCode
        message
      }
    }
  }
`

export const TRANSITION_ORDER_TO_STATE = `
  mutation TransitionOrderToState($state: String!) {
    transitionOrderToState(state: $state) {
      ... on Order {
        id
        code
        state
      }
      ... on OrderStateTransitionError {
        errorCode
        message
        transitionError
        fromState
        toState
      }
    }
  }
`