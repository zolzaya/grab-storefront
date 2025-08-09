# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Vendure Storefront

## Project Overview

This is a modern ecommerce storefront built with Remix, designed to integrate seamlessly with the Vendure backend. It provides a complete shopping experience with product browsing, cart management, and order processing.

## Tech Stack

- **Framework**: Remix (React Router v7)
- **UI Library**: Custom React components with Tailwind CSS
- **Styling**: Tailwind CSS
- **GraphQL Client**: graphql-request
- **TypeScript**: Full type safety
- **Backend**: Vendure ecommerce API

## Environment Setup

The project requires these environment variables:

- `VENDURE_SHOP_API_URL`: URL to the Vendure shop API (default: http://localhost:4000/shop-api)

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

## Styling System - Shopify-Inspired Design

The storefront features a modern, professional design system inspired by Shopify's premium aesthetic:

### Design Tokens

- **Tailwind CSS**: Enhanced configuration with custom design tokens
- **Color Palette**: Professional brand colors, neutrals, and semantic colors
  - Brand: Blue gradient scale (50-900) for primary elements
  - Neutral: Extended gray scale (50-950) for text and backgrounds
  - Success/Error/Warning: Semantic colors for status indicators
- **Typography**: Inter font family for clean, modern readability
- **Spacing**: Extended scale including 18, 88, 128, 144 for precise layouts
- **Shadows**: Custom shadow system (soft, medium, large, inner-soft)
- **Border Radius**: Extended options (xl, 2xl, 3xl) for modern card designs
- **Animations**: Custom keyframes for smooth micro-interactions

### Component Design Patterns

**Header Component:**
- Sticky navigation with scroll-based shadow effects
- Interactive mobile menu with slide-out drawer animation
- Full-screen search overlay with backdrop blur
- Cart badge with bounce animations for item updates
- Gradient announcement bar with enhanced messaging

**ProductCard Component:**
- Modern card layout with subtle shadows and rounded corners
- Hover effects with image scaling and quick-add button reveal
- Wishlist functionality with heart icon animations
- Sale badges with discount percentages
- Stock status indicators with color coding
- Color variant swatches with hover effects
- Smooth transitions for all interactive elements

**Hero Section:**
- Gradient backgrounds with animated blob elements
- Social proof indicators (customer avatars, ratings)
- Enhanced CTAs with hover animations and icons
- Responsive layout with mobile-first design
- Staggered animations for content reveal

**Footer Design:**
- Dark gradient background with decorative elements
- Newsletter signup with backdrop blur effects
- Organized link sections with hover animations
- Social media icons with scale effects
- Payment method indicators and service status

### Animation System

- **Fade In Animations**: Smooth content reveals on page load
- **Hover Effects**: Scale, translate, and color transitions
- **Micro-interactions**: Button states, form focus, card hovers
- **Loading States**: Pulse animations and skeleton screens
- **Scroll Animations**: Staggered reveals and parallax effects

### Responsive Design

- **Mobile-first**: Optimized for mobile with progressive enhancement
- **Breakpoint System**: sm, md, lg, xl with consistent spacing
- **Touch Targets**: Properly sized for mobile interaction
- **Navigation**: Responsive header with mobile drawer menu
- **Grid Layouts**: Adaptive product grids and content sections

### Accessibility Features

- **Keyboard Navigation**: Full support for keyboard users
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color combinations
- **Focus States**: Clear visual focus indicators
- **Alternative Text**: Comprehensive image descriptions

### Premium UI Elements

- **Card-based Design**: Consistent use of elevated cards with shadows
- **Gradient Accents**: Subtle gradients for visual interest
- **Icon System**: Consistent icon usage with proper sizing
- **Button Hierarchy**: Primary, secondary, and outline button styles
- **Form Design**: Modern inputs with focus states and validation
- **Loading States**: Professional skeleton screens and spinners

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

- `npm run test`: Run all unit and integration tests with Vitest
- `npm run test:watch`: Run tests in watch mode during development
- `npm run test:coverage`: Generate test coverage reports

### Test Configuration

- **Vitest Config**: Located in `vitest.config.ts`
- **Test Environment**: jsdom for component testing
- **Test Setup**: Global setup in `tests/setup.ts` with environment variables and mocks

## Development Notes

- Ensure Vendure backend is running before starting storefront
- GraphQL endpoint is configurable via environment variables
- Custom UI components follow consistent design patterns
- TypeScript types match Vendure's GraphQL schema exactly
- Cart state is managed server-side via Vendure sessions
- Run full test suite before committing changes
- Use test-driven development for new features

### Design System Guidelines

**When creating new components:**
- Use the established color palette (brand, neutral, success, error, warning)
- Apply consistent spacing scale and shadow system
- Implement hover states and micro-interactions
- Ensure mobile-first responsive design
- Add proper accessibility attributes (ARIA labels, keyboard navigation)
- Use semantic HTML elements for screen readers

**Animation Guidelines:**
- Keep animations subtle and purposeful (200-500ms duration)
- Use ease-in-out or custom bounce-soft timing functions
- Implement staggered animations for lists (0.05s-0.1s delays)
- Add loading states with pulse animations
- Ensure animations respect user's motion preferences

**Component Patterns:**
- Card components should use rounded-2xl and shadow-soft/medium
- Buttons should have proper focus states and hover animations
- Forms should include validation states and loading indicators
- Navigation elements should have clear active/hover states
- Images should have proper loading states and fallbacks

**Code Quality:**
- Run `npm run lint` and `npm run typecheck` before committing
- Fix accessibility warnings from ESLint jsx-a11y rules
- Use semantic HTML and proper ARIA labels
- Ensure all interactive elements are keyboard accessible
- Test components on mobile devices and various screen sizes
