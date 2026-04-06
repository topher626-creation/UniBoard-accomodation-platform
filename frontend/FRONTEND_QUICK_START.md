# UniBoard Frontend - Quick Start Guide

## Running the Application

### Prerequisites
- Node.js 18+ installed
- Both frontend and backend servers running

### Start Development Server
```bash
npm run dev
# Frontend: http://localhost:5175
# Backend: http://localhost:5000
```

### Build for Production
```bash
npm run build
```

## Common Tasks

### 1. Fetching Data from API

```typescript
import { apiClient } from '@/lib/api';
import { Property } from '@/types';

// Simple GET request with type safety
const properties = await apiClient.get<Property[]>('/properties');

// POST request
const newProperty = await apiClient.post<Property>('/properties', {
  name: 'My Apartment',
  price: 5000,
  // ...
});
```

### 2. Using Authentication

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useAuthActions } from '@/hooks/useAuth';

// Get auth state
const { user, isAuthenticated, logout } = useAuthStore();

// Login/Register
const { login, register } = useAuthActions();
await login(email, password);
```

### 3. Creating Forms with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations';
import { LoginFormData } from '@/lib/validations';

export function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuthActions();

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 4. Managing Global Notifications

```typescript
import { useUiStore } from '@/stores/uiStore';

export function MyComponent() {
  const { addNotification } = useUiStore();

  const handleSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Action completed!',
      duration: 3000,
    });
  };

  return <button onClick={handleSuccess}>Success</button>;
}
```

### 5. Type-Safe Components

```typescript
import { User, Property } from '@/types';

interface PropertyListProps {
  properties: Property[];
  currentUser: User | null;
  onSelect: (property: Property) => void;
}

export function PropertyList({ 
  properties, 
  currentUser, 
  onSelect 
}: PropertyListProps) {
  return (
    <div>
      {properties.map((property) => (
        <button key={property.id} onClick={() => onSelect(property)}>
          {property.name}
        </button>
      ))}
    </div>
  );
}
```

## API Response Handling

### Automatic Features
✅ Token injection in Authorization header
✅ JSON parsing
✅ Error conversion to ApiError type
✅ 401 auto-redirect to login
✅ Type-safe responses with generics

### Error Handling
```typescript
try {
  const data = await apiClient.post('/properties', formData);
} catch (error) {
  // error is typed as ApiError
  console.error(error.message, error.status);
}
```

## State Management Pattern

### Zustand Store Structure
```typescript
// Read state
const user = useAuthStore((state) => state.user);

// Multiple selections (optimized)
const { user, isAuthenticated } = useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
}));

// Update state
const setUser = useAuthStore((state) => state.setUser);
setUser(newUser);
```

## React Query Integration

While not yet fully migrated, React Query is configured and ready:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: () => apiClient.get('/properties'),
  });
}
```

## File Organization Rules

### TypeScript Files
- Components: `.tsx`
- Utilities/Hooks: `.ts`
- Config: `.ts`

### Import Organization
1. External libraries
2. Internal types
3. Internal utilities
4. Components

```typescript
import { useState } from 'react';
import { User, Property } from '@/types';
import { apiClient } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
```

## Common Pitfalls to Avoid

❌ Mixing state management (use Zustand for auth, React Query for server data)
❌ Making API calls in useEffect without dependencies
❌ Not typing component props
❌ Using localStorage directly (use Zustand store.hydrate())
❌ Manual axios calls (always use apiClient)

## Helpful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Linting
npm run lint

# Type checking (if configured)
npx tsc --noEmit
```

## Troubleshooting

### Import errors with '@/' path
- Ensure TypeScript and Vite configs are synced
- Restart development server after config changes

### Type errors in forms
- Check Zod schema matches form field names
- Verify useForm resolver is zodResolver

### Authentication not persisting
- Check localStorage in browser DevTools
- Verify useAuthStore.hydrate() is called in App.jsx

### API calls failing
- Check backend is running on port 5000
- Verify VITE_API_URL in .env file
- Check Authorization header in Network tab

## Documentation

See FRONTEND_TECH_STACK.md for detailed architecture and patterns.
