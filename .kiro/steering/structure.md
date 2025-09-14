# Project Structure & Organization

## Monorepo Layout

```
kiro-hackathon-mad-mall/
├── packages/                    # Main application packages
│   ├── web-app/                # Next.js frontend application
│   ├── api-gateway/            # Smithy API definitions & Lambda handlers
│   ├── infrastructure/         # AWS CDK constructs and stacks
│   ├── shared-types/           # Shared TypeScript definitions
│   ├── bedrock-agents/         # AI agent implementations
│   ├── titanengine/            # Core AI validation service
│   └── docs/                   # Package documentation
├── docs/                       # Project documentation
│   ├── development/            # Development guides
│   ├── governance/             # Project governance
│   ├── research/               # Research documents
│   ├── collaboration/          # Partnership documents
│   ├── demos/                  # Demo scripts and guides
│   └── platform/               # Platform architecture docs
├── .kiro/                      # Kiro IDE configuration
│   ├── steering/               # AI assistant guidance rules
│   └── specs/                  # Feature specifications
├── config/                     # Shared configuration files
├── scripts/                    # Build and deployment scripts
└── madmall-web-legacy-backup/  # Legacy Vite application (backup)
```

## Package Dependencies

### Dependency Flow
```
web-app → shared-types
api-gateway → shared-types, infrastructure
infrastructure → shared-types
bedrock-agents → shared-types
titanengine → shared-types
```

### Workspace References
- Use `workspace:*` for internal package dependencies
- Shared types are consumed by all packages
- Infrastructure package provides CDK constructs for deployment

## Naming Conventions

### Packages
- Scoped under `@madmall/` namespace
- Kebab-case for package names: `@madmall/web-app`
- Workspace filter syntax: `pnpm --filter @madmall/web-app`

### Files & Directories
- **Components**: PascalCase (`HeroSection.tsx`)
- **Utilities**: camelCase (`timeUtils.ts`)
- **Pages**: PascalCase for Next.js App Router (`page.tsx`)
- **API Routes**: kebab-case directories (`/api/user-profile/`)
- **Smithy Models**: kebab-case (`user.smithy`, `business.smithy`)

### Code Organization
- **Frontend**: Feature-based organization in `src/` directories
- **Backend**: Handler-based organization with shared utilities
- **Infrastructure**: Stack-based organization with reusable constructs
- **Types**: Domain-based organization (`domain/`, `api/`, `events/`)

## Configuration Files

### Root Level
- `.projenrc.ts` - Projen project configuration
- `pnpm-workspace.yaml` - Workspace package definitions
- `nx.json` - Nx build orchestration config
- `tsconfig.json` - Root TypeScript configuration

### Package Level
- `package.json` - Package dependencies and scripts
- `tsconfig.json` - Package-specific TypeScript config
- `jest.config.js` - Testing configuration (where applicable)

## Development Patterns

### Import Conventions
```typescript
// Internal package imports
import { UserProfile } from '@madmall/shared-types';

// Relative imports within package
import { validateInput } from '../utils/validation';
import { UserCard } from './UserCard';
```

### File Structure Within Packages
```
src/
├── components/     # Reusable UI components
├── pages/         # Next.js pages (web-app only)
├── handlers/      # Lambda handlers (api-gateway only)
├── utils/         # Utility functions
├── types/         # Package-specific types
├── services/      # External service integrations
└── __tests__/     # Test files
```

## Documentation Standards
- Each package has its own README.md
- API documentation generated from Smithy models
- Architecture decisions documented in `/docs/`
- Demo scripts and guides in `/docs/demos/`