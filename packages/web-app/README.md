# MADMall Web Application

Next.js 15 web application with App Router architecture for the MADMall Social Wellness Hub.

## Features

- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **Server-Side Rendering (SSR)** for improved performance
- **CSS Modules** support with existing Kadir Nelson theme
- **Cloudscape Design System** for consistent UI components
- **Environment-specific configuration** for different deployment environments

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page (Concourse)
│   ├── circles/           # Peer Circles page
│   ├── comedy/            # Comedy Lounge page
│   ├── stories/           # Story Booth page
│   ├── marketplace/       # Marketplace page
│   ├── resources/         # Resource Hub page
│   ├── auth/              # Authentication page
│   └── profile/           # User Profile page
├── components/            # React components
│   ├── pages/             # Page-specific components
│   └── providers/         # Context providers
├── styles/                # CSS files
│   ├── kadir-nelson-theme.css
│   ├── hero-sections.css
│   └── concourse-interactions.css
└── lib/                   # Utility functions
```

## Environment Configuration

The application supports different environment configurations:

- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.local.example` - Example environment file

### Environment Variables

- `NEXT_PUBLIC_API_URL` - API base URL
- `NEXT_PUBLIC_TITANENGINE_URL` - TitanEngine service URL
- `NEXT_PUBLIC_ENABLE_DEBUG` - Enable debug mode

## Styling

The application uses the existing Kadir Nelson theme with:

- **CSS Custom Properties** for consistent theming
- **Cloudscape Design System** integration
- **Responsive design** with mobile-first approach
- **Accessibility** features and focus states

## Routing

The application uses Next.js App Router with file-based routing:

- `/` - Concourse (main hub)
- `/circles` - Peer Circles
- `/comedy` - Comedy Lounge
- `/stories` - Story Booth
- `/marketplace` - Marketplace
- `/resources` - Resource Hub
- `/auth` - Authentication
- `/profile` - User Profile

## Build Optimization

- **Code splitting** at route and component level
- **Image optimization** with Next.js Image component
- **Bundle analysis** available with `ANALYZE=true`
- **Production optimizations** including console.log removal

## Deployment

The application can be deployed in different modes:

- **Standard deployment** - Default Next.js deployment
- **Standalone deployment** - Self-contained deployment with `BUILD_STANDALONE=true`

## Migration Notes

This package is part of the AWS PDK Enterprise Migration and serves as the foundation for migrating the existing React/Vite application to Next.js 15. The current implementation includes:

1. ✅ Basic Next.js 15 setup with App Router
2. ✅ TypeScript configuration
3. ✅ Environment variable handling
4. ✅ CSS modules and theme integration
5. ✅ Basic routing structure
6. ✅ Placeholder page components

### Next Steps

The following components and features will be migrated in subsequent tasks:

- React components from `madmall-web/src/components`
- Page implementations from `madmall-web/src/pages`
- API integration and data fetching
- Authentication and user management
- Advanced features and interactions

## Contributing

This package follows the monorepo structure and should be developed as part of the overall AWS PDK migration project.