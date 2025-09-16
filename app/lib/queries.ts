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
      shippingLines {
        shippingMethod {
          id
          name
          description
        }
        priceWithTax
      }
      customer {
        id
        firstName
        lastName
        emailAddress
      }
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

export const GET_ORDER_BY_CODE = `
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
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
      payments {
        id
        method
        amount
        state
      }
    }
  }
`

// Authentication queries and mutations
export const AUTHENTICATE = `
  mutation Authenticate($input: AuthenticationInput!) {
    authenticate(input: $input) {
      ... on CurrentUser {
        id
        identifier
        channels {
          id
          code
          token
        }
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on NotVerifiedError {
        errorCode
        message
      }
    }
  }
`

export const REGISTER_CUSTOMER_ACCOUNT = `
  mutation RegisterCustomerAccount($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      ... on Success {
        success
      }
      ... on MissingPasswordError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`

export const VERIFY_CUSTOMER_ACCOUNT = `
  mutation VerifyCustomerAccount($token: String!, $password: String) {
    verifyCustomerAccount(token: $token, password: $password) {
      ... on CurrentUser {
        id
        identifier
        channels {
          id
          code
          token
        }
      }
      ... on VerificationTokenInvalidError {
        errorCode
        message
      }
      ... on VerificationTokenExpiredError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on PasswordAlreadySetError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`

export const REQUEST_PASSWORD_RESET = `
  mutation RequestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`

export const RESET_PASSWORD = `
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      ... on CurrentUser {
        id
        identifier
        channels {
          id
          code
          token
        }
      }
      ... on PasswordResetTokenInvalidError {
        errorCode
        message
      }
      ... on PasswordResetTokenExpiredError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`

export const LOGOUT = `
  mutation Logout {
    logout {
      success
    }
  }
`

export const ME = `
  query Me {
    me {
      id
      identifier
      firstName
      lastName
      phoneNumber
      emailAddress
      channels {
        id
        code
        token
      }
    }
  }
`

export const UPDATE_CUSTOMER = `
  mutation UpdateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      ... on Customer {
        id
        firstName
        lastName
        phoneNumber
        emailAddress
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`

export const UPDATE_CUSTOMER_PASSWORD = `
  mutation UpdateCustomerPassword($currentPassword: String!, $newPassword: String!) {
    updateCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      ... on Success {
        success
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
    }
  }
`

export const UPDATE_CUSTOMER_EMAIL_ADDRESS = `
  mutation UpdateCustomerEmailAddress($password: String!, $newEmailAddress: String!) {
    updateCustomerEmailAddress(password: $password, newEmailAddress: $newEmailAddress) {
      ... on Success {
        success
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on EmailAddressConflictError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`

export const CREATE_CUSTOMER_ADDRESS = `
  mutation CreateCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      country {
        id
        name
        code
      }
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
    }
  }
`

export const UPDATE_CUSTOMER_ADDRESS = `
  mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      country {
        id
        name
        code
      }
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
    }
  }
`

export const DELETE_CUSTOMER_ADDRESS = `
  mutation DeleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
    }
  }
`

export const GET_CUSTOMER_ADDRESSES = `
  query GetCustomerAddresses {
    activeCustomer {
      id
      addresses {
        id
        fullName
        company
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          id
          name
          code
        }
        phoneNumber
        defaultShippingAddress
        defaultBillingAddress
      }
    }
  }
`

export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders($options: OrderListOptions) {
    activeCustomer {
      id
      orders(options: $options) {
        items {
          id
          code
          state
          orderPlacedAt
          total
          totalWithTax
          totalQuantity
          currencyCode
          lines {
            id
            quantity
            linePriceWithTax
            productVariant {
              id
              name
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
          shippingAddress {
            fullName
            company
            streetLine1
            streetLine2
            city
            province
            postalCode
            country
            phoneNumber
          }
          payments {
            id
            method
            amount
            state
            metadata
          }
        }
        totalItems
      }
    }
  }
`

export const GET_AVAILABLE_COUNTRIES = `
  query GetAvailableCountries {
    availableCountries {
      id
      name
      code
    }
  }
`

// Enhanced filtering queries for category page
export const GET_COLLECTION_PRODUCTS_WITH_FILTERS = `
  query GetCollectionProductsWithFilters($collectionId: ID!, $options: ProductListOptions) {
    collection(id: $collectionId) {
      id
      name
      slug
      productVariants(options: $options) {
        items {
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
          product {
            id
            name
            slug
            description
            featuredAsset {
              id
              preview
            }
            collections {
              id
              name
              slug
            }
            facetValues {
              id
              name
              code
              facet {
                id
                name
                code
              }
            }
          }
        }
        totalItems
        facetValues {
          facetValue {
            id
            name
            code
            facet {
              id
              name
              code
            }
          }
          count
        }
      }
    }
  }
`

// Very basic products query for testing
export const GET_PRODUCTS_BASIC = `
  query GetProductsBasic {
    products {
      items {
        id
        name
        slug
        variants {
          id
          name
          price
          priceWithTax
        }
      }
      totalItems
    }
  }
`

// Simple products query for testing
export const GET_PRODUCTS_SIMPLE = `
  query GetProductsSimple($options: ProductListOptions) {
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
        }
      }
      totalItems
    }
  }
`

export const GET_PRODUCTS_WITH_FILTERS = `
  query GetProductsWithFilters($options: ProductListOptions) {
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

export const GET_COLLECTION_WITH_PRODUCTS = `
  query GetCollectionWithProducts($slug: String!, $options: ProductListOptions) {
    collection(slug: $slug) {
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
        productVariants {
          totalItems
        }
      }
      productVariants(options: $options) {
        items {
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
          product {
            id
            name
            slug
            description
            featuredAsset {
              id
              preview
            }
            collections {
              id
              name
              slug
            }
            facetValues {
              id
              name
              code
              facet {
                id
                name
                code
              }
            }
            customFields
          }
        }
        totalItems
        facetValues {
          facetValue {
            id
            name
            code
            facet {
              id
              name
              code
            }
          }
          count
        }
      }
    }
  }
`

export const GET_SEARCH_RESULTS = `
  query GetSearchResults(
    $term: String,
    $facetValueIds: [ID!],
    $facetValueOperator: LogicalOperator,
    $collectionId: ID,
    $collectionSlug: String,
    $groupByProduct: Boolean,
    $take: Int,
    $skip: Int,
    $sort: SearchResultSortParameter
  ) {
    search(input: {
      term: $term,
      facetValueIds: $facetValueIds,
      facetValueOperator: $facetValueOperator,
      collectionId: $collectionId,
      collectionSlug: $collectionSlug,
      groupByProduct: $groupByProduct,
      take: $take,
      skip: $skip,
      sort: $sort
    }) {
      items {
        productId
        productName
        slug
        description
        sku
        price {
          ... on PriceRange {
            min
            max
          }
          ... on SinglePrice {
            value
          }
        }
        priceWithTax {
          ... on PriceRange {
            min
            max
          }
          ... on SinglePrice {
            value
          }
        }
        productAsset {
          id
          preview
        }
        collectionIds
        facetIds
        facetValueIds
        score
      }
      totalItems
      facetValues {
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
        count
      }
    }
  }
`

export const GET_FACETS = `
  query GetFacets($options: FacetListOptions) {
    facets(options: $options) {
      items {
        id
        name
        code
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`

export const GET_COLLECTIONS_TREE = `
  query GetCollectionsTree {
    collections {
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
          children {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
            productVariants {
              totalItems
            }
          }
          productVariants {
            totalItems
          }
        }
        productVariants {
          totalItems
        }
      }
    }
  }
`

export const GET_PRICE_RANGE = `
  query GetPriceRange($collectionSlug: String) {
    searchMin: search(input: {
      collectionSlug: $collectionSlug,
      take: 1,
      sort: { price: ASC }
    }) {
      items {
        price {
          ... on PriceRange {
            min
          }
          ... on SinglePrice {
            value
          }
        }
      }
    }
    searchMax: search(input: {
      collectionSlug: $collectionSlug,
      take: 1,
      sort: { price: DESC }
    }) {
      items {
        price {
          ... on PriceRange {
            max
          }
          ... on SinglePrice {
            value
          }
        }
      }
    }
  }
`