# Vendure Storefront

A modern ecommerce storefront built with Remix, designed to work with Vendure backend.

## Tech Stack

- **Framework**: Remix (React Router v7)
- **UI Library**: Custom React components with Tailwind CSS
- **Styling**: Tailwind CSS
- **GraphQL Client**: graphql-request
- **Backend**: Vendure ecommerce backend

## Features

- 🏠 Modern homepage with hero section and featured products
- 🛍️ Product listing with search and pagination
- 📱 Responsive product detail pages with image galleries
- 🛒 Shopping cart functionality (add, remove, adjust quantities)
- 📂 Collection browsing
- 🎨 Beautiful custom UI components with Tailwind CSS
- ⚡ Fast loading with Remix's SSR and data loading
- 🔍 SEO-friendly with proper meta tags

## Getting Started

### Prerequisites

- Node.js 20+ 
- A running Vendure backend (see `../backend/` directory)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Vendure backend URL:
```
VENDURE_SHOP_API_URL=http://localhost:3000/shop-api
```

### Development

Start the development server:
```bash
npm run dev
```

The storefront will be available at `http://localhost:3000` (or the next available port).

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Site header with navigation and cart
│   ├── Footer.tsx      # Site footer
│   └── ProductCard.tsx # Product card component
├── lib/                # Utilities and configuration
│   ├── graphql.ts      # GraphQL client setup
│   ├── queries.ts      # GraphQL queries and mutations
│   └── types.ts        # TypeScript type definitions
├── routes/             # Remix routes
│   ├── _index.tsx      # Homepage
│   ├── products._index.tsx  # Product listing
│   ├── products.$slug.tsx   # Product detail pages
│   ├── collections._index.tsx # Collection listing
│   └── cart.tsx        # Shopping cart
└── root.tsx            # Root layout with header/footer
```

## GraphQL Integration

The storefront connects to your Vendure backend using GraphQL queries for:

- **Products**: Fetching product listings, details, and search
- **Collections**: Loading product collections and categories  
- **Cart**: Managing the shopping cart (add/remove/adjust items)
- **Orders**: Retrieving the active order/cart state

## Customization

### Styling
- Tailwind CSS classes can be customized in `tailwind.config.ts`
- Custom UI components can be themed and customized
- Global styles are in `app/tailwind.css`

### Backend Integration
- GraphQL endpoint is configurable via `VENDURE_SHOP_API_URL`
- Queries and mutations are in `app/lib/queries.ts`
- TypeScript types match Vendure's GraphQL schema

### Components
- All UI components follow consistent design patterns
- Components are in `app/components/` and can be customized
- Layout components (Header/Footer) include navigation and branding

## Deployment

This is a standard Remix application that can be deployed to:

- Vercel
- Netlify  
- Railway
- Render
- Docker containers
- Node.js servers

See the [Remix deployment docs](https://remix.run/docs/en/main/guides/deployment) for detailed instructions.

## Environment Variables

- `VENDURE_SHOP_API_URL` - URL to your Vendure shop API (default: http://localhost:3000/shop-api)

## Contributing

1. Make sure your Vendure backend is running with sample data
2. Start the storefront development server
3. Test all features (browsing, search, cart, etc.)
4. Follow the existing code patterns and component structure
