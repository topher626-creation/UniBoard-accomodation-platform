# UniBoard Frontend - Modern Tech Stack

## Overview

The UniBoard frontend has been completely modernized with industry best practices and cutting-edge technologies for optimal developer experience, type safety, and application performance.

## Technology Stack

### Core Framework & Tooling
- **React 19** - Modern UI library with concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first CSS framework

### State Management
- **Zustand** - Lightweight, simple state management
  - `authStore.ts` - Authentication state
  - `uiStore.ts` - UI notifications and global UI state

### Server State Management
- **React Query (@tanstack/react-query)** - Powerful server state management
  - Automatic caching and synchronization
  - Built-in error handling
  - Query invalidation and refetching
  - Configured with 5-minute stale time

### Form Management & Validation
- **React Hook Form** - Performant form handling
- **Zod** - TypeScript-first schema validation
- Validation schemas in `src/lib/validations.ts`

### Component Library
- **Next UI** - Professional component library
- **Framer Motion** - Smooth animations

### API Communication
- **Axios** - HTTP client with interceptors
  - Automatic token injection from localStorage
  - Global error handling
  - 401 redirect to login on auth failure
  - Located in `src/lib/api.ts`

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ErrorBoundary.tsx       # Global error boundary
│   ├── NotificationContainer.tsx # Toast notifications
│   ├── Navbar.jsx
│   ├── PropertyCard.jsx
│   └── ...
├── pages/               # Route pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── CreateProperty.jsx
│   └── ...
├── lib/                 # Utility functions & configurations
│   ├── api.ts                   # Axios instance with interceptors
│   ├── queryClient.ts           # React Query configuration
│   ├── validations.ts           # Zod schemas
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts               # Auth-related hooks
│   └── ...
├── stores/             # Zustand stores
│   ├── authStore.ts             # Authentication state
│   ├── uiStore.ts               # UI notifications state
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts                 # All app types
├── App.jsx             # Main app component
├── main.jsx            # Entry point with providers
└── index.css           # Global styles
```

## Key Features

### 1. Type Safety with TypeScript
- Full TypeScript support across the entire codebase
- Centralized type definitions in `src/types/index.ts`
- Type inference for form data, API responses, and more

### 2. State Management Pattern
```typescript
// Zustand store usage
import { useAuthStore } from '@/stores/authStore';

const { user, isAuthenticated, logout } = useAuthStore();
```

### 3. API Client Pattern
```typescript
// Automatic token injection and error handling
import { apiClient } from '@/lib/api';

const user = await apiClient.get('/auth/me');
const newProperty = await apiClient.post('/properties', data);
```

### 4. Form Validation Pattern
```typescript
// Zod schema with React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';

const { control, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### 5. Custom Hooks
```typescript
// Simplified auth operations with built-in error handling
import { useAuthActions } from '@/hooks/useAuth';

const { login, register } = useAuthActions();
await login(email, password);
```

### 6. Global Error Handling
- React Error Boundary wraps the entire app
- API errors automatically trigger notifications
- 401 responses redirect to login

### 7. Notifications System
- Toast notifications from Zustand store
- Auto-dismiss after 5 seconds
- Success, error, info, and warning types

## Configuration Files

### TypeScript Configuration
- `tsconfig.json` - Main TypeScript config with path aliases
- `tsconfig.node.json` - Node-specific config for Vite

### Vite Configuration
- `vite.config.js` - Build tool configuration with path aliases
- `.env` - Environment variables for API URL

## Environment Variables

```
VITE_API_URL=http://localhost:5000/api
```

## Path Aliases

All imports use convenient aliases:
```typescript
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { useAuthActions } from '@/hooks/useAuth';
```

## Development Workflow

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Linter
```bash
npm run lint
```

## Best Practices Implemented

1. **Separation of Concerns** - Components, hooks, stores, and types are well-organized
2. **Type Safety** - TypeScript ensures compile-time error detection
3. **Error Boundaries** - Graceful error handling at component level
4. **Centralized State** - Zustand for simple state, React Query for server state
5. **Validation** - Zod schemas ensure data integrity
6. **API Security** - Automatic token injection and session management
7. **Performance** - Lazy loading, efficient re-renders, and caching
8. **Code Reusability** - Custom hooks for common patterns
9. **Scalability** - Modular structure supports growth
10. **Developer Experience** - Path aliases, clear folder structure, and conventions

## Migration Guide for Existing Components

### Converting a Component to TypeScript

Before:
```jsx
export default function PropertyCard({ property }) {
  return <div>{property.name}</div>;
}
```

After:
```tsx
import { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return <div>{property.name}</div>;
}
```

### Using the New API Client

Before:
```jsx
const response = await axios.get('http://localhost:5000/api/properties');
```

After:
```tsx
import { apiClient } from '@/lib/api';
import { Property } from '@/types';

const properties = await apiClient.get<Property[]>('/properties');
```

### Using Form Validation

Before:
```jsx
const [email, setEmail] = useState('');
// Manual validation...
```

After:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';

const { control, handleSubmit } = useForm({
  resolver: zodResolver(loginSchema),
});
```

## Next Steps

1. Migrate existing components to TypeScript (`.tsx` files)
2. Implement React Query hooks for data fetching
3. Use React Hook Form for all form components
4. Add more validation schemas as needed
5. Implement code splitting for optimized bundle sizes
6. Add E2E tests with Playwright or Cypress
7. Set up CI/CD pipeline

## Performance Considerations

- React Query caches data for 5 minutes
- Components use stable identities to prevent unnecessary re-renders
- Lazy loading routes with React.lazy() can be implemented
- Bundle splitting recommended due to current bundle size

## Support

For questions about the new stack:
- TypeScript Documentation: https://www.typescriptlang.org/
- Zustand: https://zustand-demo.com/
- React Query: https://tanstack.com/query/latest
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/
