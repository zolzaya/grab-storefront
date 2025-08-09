# Vendure Storefront

## Project Overview
This is a modern ecommerce storefront built with Remix and Storefront UI, designed to integrate seamlessly with the Vendure backend. It provides a complete shopping experience with product browsing, cart management, and order processing.

## Tech Stack
- **Framework**: Remix (React Router v7)
- **UI Library**: Storefront UI React components
- **Styling**: Tailwind CSS
- **GraphQL Client**: graphql-request
- **TypeScript**: Full type safety
- **Backend**: Vendure ecommerce API

## Environment Setup
The project requires these environment variables:
- `VENDURE_SHOP_API_URL`: URL to the Vendure shop API (default: http://localhost:3000/shop-api)

## Development Commands
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run typecheck`: Run TypeScript type checking
- `npm run lint`: Run ESLint
- `npm run test`: Run test suite

## Project Structure
```
app/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Site header with navigation and cart badge
│   ├── Footer.tsx      # Site footer with links
│   └── ProductCard.tsx # Product display card component
├── lib/                # Core utilities and configuration
│   ├── graphql.ts      # GraphQL client setup and request wrapper
│   ├── queries.ts      # All GraphQL queries and mutations
│   └── types.ts        # TypeScript type definitions matching Vendure schema
├── routes/             # Remix file-based routing
│   ├── _index.tsx      # Homepage with hero and featured products
│   ├── products._index.tsx  # Product listing with search and pagination
│   ├── products.$slug.tsx   # Individual product detail pages
│   ├── collections._index.tsx # Collection/category listing
│   └── cart.tsx        # Shopping cart management
└── root.tsx            # Root layout with global header/footer
```

## Key Features
- **Homepage**: Hero section with featured products and store information
- **Product Catalog**: Full product listing with search, pagination, and filtering
- **Product Details**: Rich product pages with image galleries, variant selection, and add-to-cart
- **Shopping Cart**: Full cart management (add, remove, adjust quantities)
- **Collections**: Browse products by category/collection
- **Responsive Design**: Mobile-first responsive layout using Tailwind CSS
- **SEO Optimized**: Proper meta tags and semantic HTML
- **TypeScript**: Full type safety with Vendure GraphQL schema types

## GraphQL Integration
The storefront communicates with Vendure via GraphQL:

### Queries Used:
- `GET_PRODUCTS`: Fetch product listings with filtering and pagination
- `GET_PRODUCT`: Fetch individual product details by slug
- `GET_COLLECTIONS`: Fetch product collections/categories
- `GET_ACTIVE_ORDER`: Retrieve current shopping cart state

### Mutations Used:
- `ADD_ITEM_TO_ORDER`: Add products to shopping cart
- `REMOVE_ORDER_LINE`: Remove items from cart
- `ADJUST_ORDER_LINE`: Update item quantities in cart

## Component Architecture
- **Header**: Navigation with cart badge showing item count
- **ProductCard**: Reusable product display with image, name, price, and rating
- **Layout Components**: Consistent header/footer across all pages
- **Storefront UI**: Professional ecommerce components (buttons, ratings, etc.)

## Styling System
- **Tailwind CSS**: Utility-first CSS framework
- **Storefront UI Theme**: Professional ecommerce component library
- **Responsive Design**: Mobile-first approach with breakpoints
- **Color Scheme**: Blue/purple gradient theme with clean whites and grays

## Data Flow
1. **Server-Side Rendering**: Remix loaders fetch data on the server
2. **GraphQL Requests**: All API calls go through the graphQL client wrapper
3. **Type Safety**: TypeScript ensures data matches expected Vendure schema
4. **Client Hydration**: React takes over for interactive features
5. **Form Handling**: Remix actions handle cart operations and mutations

## Error Handling
- GraphQL request errors are caught and logged
- Graceful fallbacks for missing products/images
- User-friendly error messages for cart operations
- 404 pages for invalid product/collection routes

## Performance Features
- **Server-Side Rendering**: Fast initial page loads
- **Image Optimization**: Vendure asset pipeline with presets
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Browser caching of GraphQL responses

## Testing Strategy
The project uses a comprehensive testing approach with multiple testing layers:

### Testing Framework
- **Test Runner**: Vitest (fast, modern alternative to Jest)
- **Component Testing**: @testing-library/react for component unit tests
- **Integration Testing**: Remix testing utilities for route handlers
- **Mocking**: Mock Service Worker (MSW) for GraphQL API mocking
- **E2E Testing**: Playwright for end-to-end user flows

### Test Structure
```
tests/
├── __mocks__/           # Mock configurations
│   ├── graphql.ts      # GraphQL client mocks
│   └── vendure.ts      # Vendure API response mocks
├── components/          # Component unit tests
│   ├── Header.test.tsx
│   ├── ProductCard.test.tsx
│   └── Footer.test.tsx
├── routes/             # Route integration tests
│   ├── _index.test.tsx
│   ├── products.test.tsx
│   └── cart.test.tsx
├── lib/                # Utility function tests
│   ├── graphql.test.ts
│   └── queries.test.ts
└── e2e/                # End-to-end tests
    ├── product-browsing.spec.ts
    ├── cart-management.spec.ts
    └── checkout-flow.spec.ts
```

### Test Coverage Areas
- **Component Rendering**: All UI components render correctly with props
- **User Interactions**: Click handlers, form submissions, navigation
- **GraphQL Integration**: API requests and response handling
- **Cart Functionality**: Add/remove items, quantity updates
- **Error Handling**: Network failures, invalid data scenarios
- **Responsive Design**: Mobile and desktop layout testing
- **SEO Elements**: Meta tags, structured data validation

### Running Tests
- `npm run test`: Run all unit and integration tests
- `npm run test:watch`: Run tests in watch mode during development
- `npm run test:coverage`: Generate test coverage reports
- `npm run test:e2e`: Run end-to-end tests with Playwright
- `npm run test:components`: Run only component tests
- `npm run test:routes`: Run only route integration tests

### Test Configuration
- **Vitest Config**: Located in `vitest.config.ts`
- **MSW Setup**: Mock GraphQL responses for consistent testing
- **Test Environment**: jsdom for component testing
- **Coverage Threshold**: Minimum 80% code coverage required
- **CI Integration**: Tests run on every pull request

## Development Notes
- Ensure Vendure backend is running before starting storefront
- GraphQL endpoint is configurable via environment variables
- All Storefront UI components follow design system patterns
- TypeScript types match Vendure's GraphQL schema exactly
- Cart state is managed server-side via Vendure sessions
- Run full test suite before committing changes
- Use test-driven development for new features