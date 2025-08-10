# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Vendure Storefront

## Project Overview

This is a modern ecommerce storefront built with Remix, designed to integrate seamlessly with the Vendure backend. It provides a complete shopping experience with product browsing, cart management, and comprehensive checkout flow including upsell products.

## Tech Stack

- **Framework**: Remix (React Router v7)
- **UI Library**: Custom React components with Tailwind CSS
- **Styling**: Tailwind CSS with extended custom design system
- **GraphQL Client**: graphql-request
- **TypeScript**: Full type safety with Vendure GraphQL schema types
- **Testing**: Vitest with jsdom, @testing-library/react
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
- `npm run test`: Run test suite with Vitest
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

### Running Single Tests

- `npm test -- tests/components/Header.test.tsx`: Run a specific test file
- `npm test -- --grep "should render"`: Run tests matching a pattern
- `vitest run --reporter=verbose`: Run tests with detailed output

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Site header with navigation, mobile menu, search, cart badge
│   ├── Footer.tsx      # Site footer with links and social proof
│   ├── ProductCard.tsx # Product display card component with hover effects
│   ├── SearchBar.tsx   # Enhanced search with autocomplete and suggestions
│   ├── SortDropdown.tsx # Product sorting dropdown with multiple options
│   ├── ViewToggle.tsx  # Grid/list view toggle for product display
│   ├── Pagination.tsx  # Product pagination with page navigation
│   ├── FilterSidebar.tsx # Comprehensive filtering sidebar
│   ├── CategoryFilter.tsx # Category navigation and breadcrumbs
│   ├── CategorySidebar.tsx # Category browsing sidebar
│   ├── EnhancedSearch.tsx # Advanced search functionality
│   ├── cart/           # Cart-specific components
│   │   ├── FreeShipping.tsx
│   │   ├── PaymentMethods.tsx
│   │   └── TrustBadges.tsx
│   └── filters/        # Individual filter components
│       ├── BrandFilter.tsx      # Brand filtering with logos
│       ├── ColorFilter.tsx      # Visual color swatches
│       ├── PriceRangeFilter.tsx # Price range slider
│       ├── RatingFilter.tsx     # Star rating filter
│       └── SizeFilter.tsx       # Size selection with charts
├── lib/                # Core utilities and configuration
│   ├── graphql.ts      # GraphQL client setup with cookie forwarding
│   ├── queries.ts      # All GraphQL queries and mutations for Vendure API
│   ├── types.ts        # TypeScript type definitions matching Vendure schema
│   ├── auth.ts         # Authentication utilities and validation
│   ├── constants.ts    # App-wide constants (sort options, filters, etc.)
│   └── filters.ts      # Filter state management and URL utilities
├── routes/             # Remix file-based routing
│   ├── _index.tsx      # Homepage with hero section and featured products
│   ├── products._index.tsx  # Product listing with search and pagination
│   ├── products.$slug.tsx   # Individual product detail pages
│   ├── collections._index.tsx # Collection/category listing
│   ├── cart.tsx        # Shopping cart management with shipping banners
│   ├── checkout.tsx    # Multi-step checkout with upsells and thank-you page
│   ├── checkout.success.tsx # Order success page
│   ├── auth.login.tsx  # User login with social options and password reset
│   ├── auth.register.tsx # Account registration with validation
│   ├── auth.forgot-password.tsx # Password reset request
│   ├── auth.reset-password.tsx  # Password reset with token
│   ├── auth.verify.tsx # Account verification and optional password setup
│   ├── auth.logout.tsx # Logout handler
│   ├── account._index.tsx # Account dashboard with recent orders
│   ├── account.profile.tsx # Profile management
│   └── account.security.tsx # Password and email change
├── utils/              # Utility functions
│   └── utils.ts        # Price formatting and other helpers
└── root.tsx            # Root layout with global header/footer and active order state
```

## Key Features

- **Homepage**: Shopify-inspired hero section with animated elements, featured products, and social proof
- **Product Catalog**: Full product listing with search, pagination, and filtering
- **Product Details**: Rich product pages with image galleries, variant selection, and add-to-cart
- **Shopping Cart**: Complete cart management with free shipping banners and trust badges
- **Multi-step Checkout**: Customer info → Shipping → Payment → Thank you with upsell products
  - **Address Selection**: Logged-in users can select from saved addresses or add new ones
  - **Mongolia-Optimized**: No postal code requirements (not used in Mongolia)
- **User Authentication**: Complete auth system with login, registration, password reset, and email verification
- **Account Management**: User dashboard, profile editing, security settings, and order history
- **Collections**: Browse products by category/collection
- **Responsive Design**: Mobile-first responsive layout with mobile menu drawer
- **SEO Optimized**: Proper meta tags and semantic HTML
- **TypeScript**: Full type safety with Vendure GraphQL schema types

## GraphQL Integration

The storefront communicates with Vendure via GraphQL with proper cookie handling for sessions:

### Key Queries:
- `GET_PRODUCTS`: Product listings with filtering and pagination
- `GET_PRODUCT`: Individual product details by slug
- `GET_COLLECTIONS`: Product collections/categories
- `GET_ACTIVE_ORDER`: Current shopping cart state with session cookies
- `GET_ORDER_BY_CODE`: Completed order details for thank-you page
- `ELIGIBLE_SHIPPING_METHODS` & `ELIGIBLE_PAYMENT_METHODS`: Checkout options
- `ME`: Current user authentication status and profile data
- `GET_CUSTOMER_ORDERS`: User's order history with pagination and filtering
- `GET_CUSTOMER_ADDRESSES`: User's saved shipping/billing addresses
- `GET_AVAILABLE_COUNTRIES`: Country options for address forms

### Key Mutations:
- `ADD_ITEM_TO_ORDER`: Add products to cart
- `REMOVE_ORDER_LINE` & `ADJUST_ORDER_LINE`: Cart modifications
- `SET_CUSTOMER_FOR_ORDER`: Set customer information
- `SET_ORDER_SHIPPING_ADDRESS` & `SET_ORDER_BILLING_ADDRESS`: Address handling
- `SET_ORDER_SHIPPING_METHOD`: Shipping method selection
- `ADD_PAYMENT_TO_ORDER`: Payment processing
- `TRANSITION_ORDER_TO_STATE`: Order state transitions
- `AUTHENTICATE`: User login with credentials
- `REGISTER_CUSTOMER_ACCOUNT`: New user registration
- `VERIFY_CUSTOMER_ACCOUNT`: Email verification and password setup
- `REQUEST_PASSWORD_RESET` & `RESET_PASSWORD`: Password reset flow
- `UPDATE_CUSTOMER`: Profile information updates
- `UPDATE_CUSTOMER_PASSWORD` & `UPDATE_CUSTOMER_EMAIL_ADDRESS`: Security changes
- `CREATE_CUSTOMER_ADDRESS` & `UPDATE_CUSTOMER_ADDRESS`: Address management
- `DELETE_CUSTOMER_ADDRESS`: Address removal
- `LOGOUT`: User logout and session cleanup

## Component Architecture

### Header Component (app/components/Header.tsx)
- Sticky navigation with scroll-based shadow effects
- Mobile hamburger menu with slide-out drawer
- Full-screen search overlay with backdrop blur
- Cart badge with item count and bounce animations
- User authentication menu with profile dropdown
- Dynamic sign in/sign out functionality
- Account navigation (profile, orders, addresses, security)
- Announcement bar with promotional messaging

### ProductCard Component (app/components/ProductCard.tsx)
- Modern card design with hover effects and animations
- Image scaling on hover with quick-add functionality
- Sale badges and stock status indicators
- Wishlist functionality and color variant swatches

### Checkout Flow (app/routes/checkout.tsx)
- Multi-step process: Customer → Shipping → Payment → Thank You
- **Address Selection**: For logged-in users, displays saved addresses with option to select existing or add new
- **Mongolia-Specific**: No postal code fields (not used in Mongolia)
- Progress indicator with step completion states
- Comprehensive form validation and error handling
- Upsell product recommendations on thank-you page
- Order state management and session handling

## Styling System - Shopify-Inspired Design

### Custom Tailwind Configuration (tailwind.config.ts)
- **Extended Color Palette**: Brand colors (blue gradient), neutral grays, semantic colors
- **Custom Spacing**: Additional spacing values (18, 88, 128, 144)
- **Shadow System**: Soft, medium, large shadows with consistent design
- **Animation System**: Fade-in, bounce-soft, slide-in effects with staggered timing
- **Border Radius**: Extended options (xl, 2xl, 3xl) for modern card designs

### Design Patterns
- Card-based design with elevated shadows and rounded corners
- Gradient backgrounds and accent elements
- Smooth micro-interactions and hover states
- Consistent button hierarchy and form styling
- Professional loading states and error handling

## Testing Strategy (tests/)

### Test Structure
```
tests/
├── __mocks__/           # Mock configurations for GraphQL client
├── components/          # Component unit tests with @testing-library/react
├── routes/             # Route integration tests
├── lib/                # Utility function tests
└── setup.ts            # Global test environment setup
```

### Testing Framework
- **Vitest**: Fast test runner with jsdom environment
- **@testing-library/react**: Component testing with user interactions
- **Mock Service Worker**: GraphQL API mocking for isolated tests

### Test Coverage Areas
- Component rendering with various prop combinations
- User interactions (clicks, form submissions, navigation)
- GraphQL integration and error handling
- Cart functionality and checkout flow
- Responsive design validation

## Data Flow Architecture

1. **Server-Side Rendering**: Remix loaders fetch data on server with cookie forwarding
2. **GraphQL Client**: Centralized request handling with error logging and session management
3. **Type Safety**: All API responses typed to match Vendure GraphQL schema
4. **Client Hydration**: React takes over for interactive features
5. **Form Handling**: Remix actions handle mutations and state transitions
6. **Session Management**: Cookies forwarded between client/server for cart persistence

## Error Handling

- GraphQL request errors caught and logged with context
- User-friendly error messages for cart operations and checkout
- Graceful fallbacks for missing products, images, or API failures
- 404 pages for invalid product/collection routes
- Session expiration handling in checkout flow

## Performance Features

- **Server-Side Rendering**: Fast initial page loads with data pre-fetching
- **Image Optimization**: Vendure asset pipeline with preset parameters
- **Code Splitting**: Automatic route-based code splitting via Remix
- **Caching**: Browser caching of GraphQL responses with session handling
- **Optimistic Updates**: Immediate UI feedback for cart operations

## Development Guidelines

### Code Quality Standards
- Run `npm run lint` and `npm run typecheck` before committing
- Follow existing component patterns and naming conventions
- Use semantic HTML with proper ARIA labels for accessibility
- Implement proper error boundaries and loading states
- Test new features with unit and integration tests

### GraphQL Best Practices
- Use the centralized `shopApiRequest` function for all API calls
- Always handle GraphQL errors with user-friendly messages
- Forward request cookies for server-side API calls
- Type all GraphQL responses using the types in `lib/types.ts`

### Component Development
- Follow the established design system with Tailwind classes
- Implement hover states and micro-interactions consistently
- Use the custom animation classes for smooth transitions
- Ensure mobile-first responsive design
- Add proper TypeScript interfaces for all props

### Address Management Guidelines
- **Never include postal code fields** - Mongolia doesn't use postal codes
- Address forms should only include: Full Name, Street Lines, City, Province (optional), Country, Phone (optional)
- For checkout: Allow users to select from existing addresses or add new ones
- Saved addresses are automatically populated from customer's account

### Testing Requirements
- Write unit tests for new components using @testing-library/react
- Mock GraphQL requests using the established patterns in `__mocks__/`
- Test user interactions and form submissions
- Verify responsive behavior across breakpoints
- Ensure accessibility compliance with screen readers

## Architecture Notes

### Session Management
The storefront relies on Vendure's session-based cart management:
- Server-side requests forward cookies to maintain cart state
- GraphQL client creates separate instances for server vs client requests
- Active order is fetched in root loader and passed to header component

### Checkout Flow State Management
The checkout process uses Remix's form-based approach:
- Each step handled by specific form actions
- Order state validation before allowing progression
- Comprehensive error handling for payment and shipping failures
- Upsell products fetched and displayed on successful completion

### Mobile-First Design
- Header component includes mobile hamburger menu with slide-out drawer
- Product cards adapt to different screen sizes with responsive grids
- Checkout forms optimize for mobile input with proper field types
- Touch-friendly button sizes and spacing throughout

## Common Development Tasks

### Adding New Products Features
1. Update GraphQL queries in `lib/queries.ts` if new fields needed
2. Extend TypeScript types in `lib/types.ts` to match schema
3. Implement UI components following existing patterns
4. Add proper error handling and loading states
5. Write tests covering the new functionality

### Customizing Checkout Flow
1. Modify step definitions in `checkout.tsx` route
2. Update form validation and submission logic
3. Handle new order state transitions in actions
4. Test payment integration thoroughly in demo mode
5. Verify upsell product logic with various order combinations

### Extending Design System
1. Add custom Tailwind classes in `tailwind.config.ts`
2. Create reusable component variants following existing patterns
3. Implement consistent hover states and animations
4. Test responsive behavior across all breakpoints
5. Update component documentation and examples

## Authentication System

### Authentication Flow Architecture
The storefront implements a complete authentication system using Vendure's native auth:

1. **Registration Process**: Email/password signup with optional profile fields and email verification
2. **Login System**: Standard login with remember me option and password visibility toggle
3. **Password Recovery**: Secure reset flow with email tokens and password strength validation
4. **Account Verification**: Email verification with optional password setup for social logins
5. **Session Management**: Cookie-based sessions with automatic authentication state sync

### Authentication Routes Structure

```
auth/
├── login.tsx           # User login with social options
├── register.tsx        # Account registration with validation
├── forgot-password.tsx # Password reset request form
├── reset-password.tsx  # Password reset with token validation
├── verify.tsx          # Email verification and password setup
└── logout.tsx          # Logout handler with session cleanup
```

### Account Management System

```
account/
├── _index.tsx          # Dashboard with recent orders and quick actions
├── profile.tsx         # Personal information management
├── security.tsx        # Password and email change functionality
├── orders.tsx          # Order history with filtering and details
└── addresses.tsx       # Shipping/billing address management
```

### Authentication Utilities (app/lib/auth.ts)

**Core Functions:**
- `getCurrentUser()`: Retrieve current authenticated user
- `logout()`: End user session and clear cookies
- `requireAuth()`: Route protection helper
- `getFullName()`: User display name formatting
- `validateEmail()`, `validatePassword()`, `validateName()`, `validatePhone()`: Input validation
- `getAuthErrorMessage()`: User-friendly error message mapping

**Security Features:**
- Password strength requirements (8+ chars, uppercase, lowercase, number)
- Email format validation with comprehensive regex
- Phone number formatting and validation
- Secure error handling without information leakage
- Form field sanitization and trimming

### Authentication State Management

**Root Layout Integration (app/root.tsx):**
- Parallel loading of user authentication state and cart data
- Automatic session validation on every request
- User context passed to header component for dynamic navigation
- Error boundaries for authentication failures

**Header User Interface:**
- Authenticated users see profile dropdown with avatar and name
- Quick access to account sections (profile, orders, addresses, security)
- Logout functionality with confirmation
- Unauthenticated users see prominent "Sign In" button
- Mobile-responsive user menu with proper touch targets

### Form Validation & UX

**Registration Form Features:**
- Real-time password strength indicator
- Confirm password matching validation
- Optional phone number with automatic formatting
- Terms of service and marketing consent checkboxes
- Comprehensive error handling with field-specific feedback

**Login Form Features:**
- Password visibility toggle with eye icon
- Remember me functionality for persistent sessions  
- "Forgot password" link with prominent placement
- Social login buttons (Google, Facebook) with consistent styling
- Email and password field validation on submit

**Security Form Features:**
- Current password confirmation for sensitive changes
- Password change with strength validation
- Email address updates with password confirmation
- Clear security status indicators and tips
- Separate forms for different security operations

### Authentication Testing

**Test Coverage Includes:**
- Utility function validation (email, password, phone, name formats)
- Error message mapping and localization
- User display name generation with various input combinations
- Form rendering and user interaction flows
- Authentication state management and session handling
- GraphQL mutation success and error scenarios

**Testing Files:**
- `tests/lib/auth.test.ts`: Utility function validation testing
- `tests/routes/auth.login.test.tsx`: Login form functionality and UI testing
- Additional test files for registration, password reset, and profile management

### Integration with Vendure Backend

**Authentication Endpoints Used:**
- Customer registration with email verification
- Login with session cookie management
- Password reset token generation and validation
- Account verification with optional password setup
- Profile updates with field validation
- Security changes (password/email) with confirmation

**Session Management:**
- Automatic cookie forwarding in server-side GraphQL requests
- Session persistence across browser sessions with "remember me"
- Automatic logout on session expiration
- Secure session invalidation on password/email changes

### Security Best Practices

**Implementation Details:**
- All passwords hashed and validated server-side by Vendure
- Email verification required for new accounts
- Password reset tokens with expiration and single-use validation
- Rate limiting handled by Vendure backend
- CSRF protection through SameSite cookie settings
- Secure cookie transmission over HTTPS in production

**User Experience Security:**
- Clear security status indicators in account dashboard
- Password strength requirements communicated upfront
- Secure error messages that don't leak account information
- Automatic session timeout with clear user notification
- Two-factor authentication support ready for future implementation

## Advanced Product Filtering System

The storefront features a comprehensive filtering system inspired by modern e-commerce platforms:

### Filter Architecture
- **FilterSidebar**: Main container with collapsible sections
- **Individual Filter Components**: Modular design in `components/filters/`
- **URL State Management**: All filters reflected in URL for shareability
- **Filter State Utilities**: Centralized logic in `lib/filters.ts`

### Available Filters
- **Price Range**: Dual-handle slider with quick preset ranges
- **Color**: Visual color swatches with grid/list views
- **Size**: Smart sorting with size chart integration
- **Brand**: Logo displays with search functionality
- **Rating**: Star rating selection with distribution bars
- **Category**: Hierarchical category navigation
- **Availability**: In stock, out of stock, backorder filters

### Search Enhancement
- **Autocomplete**: Real-time product suggestions
- **Search History**: Local storage of recent searches
- **Popular Searches**: Trending search terms display
- **Visual Previews**: Product thumbnails in search results
- **Filter Integration**: Search within filtered results

## Form Validation System (RVF + Zod)

The project uses `@rvf/remix` with Zod for comprehensive form validation:

### Validation Architecture
- **Client-side**: Real-time validation with Zod schemas
- **Server-side**: Same schemas used in Remix actions
- **Type Safety**: Full TypeScript integration with inferred types
- **Error Handling**: User-friendly error messages and field highlighting

### Key Dependencies
- `@rvf/remix`: Form handling and validation hooks
- `@rvf/zod`: Zod adapter for schema validation
- `zod`: Schema validation library

### Implementation Pattern
```typescript
// Define schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

// Use in component
const form = useValidatedForm({ schema: LoginSchema })
```

## Key Architectural Patterns

### GraphQL Client Configuration
- **Cookie Forwarding**: Automatic session management for SSR
- **Error Handling**: Centralized error logging and user notifications
- **Type Safety**: All responses typed with generated Vendure schema types
- **Request Debugging**: Server-side request logging for development

### Remix Integration Patterns
- **Parallel Data Loading**: User auth and cart data loaded simultaneously
- **Form-based Mutations**: All state changes through Remix actions
- **Cookie Session Management**: Secure session handling with automatic forwarding
- **Error Boundaries**: Graceful error handling at route and component levels

### Custom Tailwind Design System
- **Brand Colors**: Extended blue gradient palette with semantic variants
- **Custom Animations**: Smooth micro-interactions (fade-in, bounce-soft, slide-in)
- **Shadow System**: Consistent elevation with soft, medium, large variants
- **Extended Spacing**: Additional values (18, 88, 128, 144) for layout consistency
- **Custom Keyframes**: Purpose-built animations for e-commerce interactions

## Performance Optimizations

### Loading Strategies
- **Skeleton Screens**: Progressive loading states for all major components
- **Image Optimization**: Vendure asset pipeline with responsive images
- **Code Splitting**: Route-based splitting with Remix's built-in optimization
- **GraphQL Caching**: Browser caching with proper cache invalidation

### Mobile Performance
- **Touch Targets**: All interactive elements meet accessibility standards
- **Responsive Images**: Optimized loading for different screen densities
- **Mobile-first CSS**: Optimized styles starting from mobile breakpoints
- **Lazy Loading**: Deferred loading for non-critical components

## Development Workflow

### Before Committing Changes
1. Run `npm run typecheck` to verify TypeScript compilation
2. Run `npm run lint` to check code style and catch issues
3. Run `npm run test` to ensure all tests pass
4. Test responsive design across breakpoints
5. Verify GraphQL queries work with your Vendure backend

### Adding New Features
1. **Planning**: Consider mobile-first design and accessibility
2. **Types**: Update TypeScript interfaces in `lib/types.ts`
3. **GraphQL**: Add queries/mutations to `lib/queries.ts`
4. **Components**: Follow existing patterns and design system
5. **Testing**: Add unit tests using `@testing-library/react`
6. **Documentation**: Update CLAUDE.md if architectural changes are made

### Common Gotchas
- **Cookie Forwarding**: Always pass `request` to server-side GraphQL calls
- **Type Safety**: Import types from `lib/types.ts`, not generated files
- **Mobile Design**: Test on actual devices, not just browser dev tools
- **Session Management**: Handle authentication state changes properly
- **Filter State**: Use URL parameters for all filter state to enable sharing

## Current Development Tasks

Based on the `todo/` directory, the project has active development in:

### Products Page Enhancement (`todo/search-page.md`)
- Advanced filtering system with faceted search
- Enhanced product discovery with multiple view modes
- Shopify-inspired user experience patterns
- Mobile-optimized filtering and search

### Form Validation Implementation (`todo/validation.md`)
- Migration to RVF + Zod validation system
- Type-safe form handling across all components
- Client and server-side validation consistency
- Comprehensive test coverage for validation logic