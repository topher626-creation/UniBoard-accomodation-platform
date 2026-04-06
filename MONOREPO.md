# UniBoard Monorepo Guide

## Overview

This is an **npm workspaces** monorepo containing two main packages:
- **@uniboard/frontend** - React + TypeScript application
- **@uniboard/backend** - Node.js + Express API

## Project Structure

```
project-root/
├── frontend/                          # Frontend package
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── NotificationContainer.tsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PropertyCard.jsx
│   │   │   └── BookingForm.jsx
│   │   ├── pages/                    # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateProperty.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── BookingConfirmation.jsx
│   │   ├── hooks/                    # Custom hooks
│   │   │   └── useAuth.ts
│   │   ├── stores/                   # Zustand state management
│   │   │   ├── authStore.ts          # Auth state
│   │   │   └── uiStore.ts            # UI notifications
│   │   ├── lib/                      # Utilities & configurations
│   │   │   ├── api.ts                # Axios API client
│   │   │   ├── queryClient.ts        # React Query config
│   │   │   └── validations.ts        # Zod schemas
│   │   ├── types/                    # TypeScript definitions
│   │   │   └── index.ts              # All app types
│   │   ├── assets/                   # Static assets
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── public/                        # Static files
│   ├── index.html                    # HTML entry
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── eslint.config.js              # ESLint config
│   ├── .env                          # Environment variables
│   ├── FRONTEND_TECH_STACK.md        # Frontend documentation
│   └── FRONTEND_QUICK_START.md       # Frontend quick guide
│
├── backend/                           # Backend package
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   │   ├── db.js                 # Database config
│   │   │   ├── cloudinary.js         # Cloudinary config
│   │   │   ├── multer.js             # File upload config
│   │   │   └── stripe.js             # Stripe config
│   │   ├── controllers/              # Business logic
│   │   │   └── *.js                  # Route handlers
│   │   ├── middleware/               # Custom middleware
│   │   │   └── auth.js               # JWT authentication
│   │   ├── models/                   # Sequelize models
│   │   │   ├── User.js
│   │   │   ├── Listing.js
│   │   │   ├── Booking.js
│   │   │   ├── Payment.js
│   │   │   └── Review.js
│   │   ├── routes/                   # API routes
│   │   │   ├── auth.js
│   │   │   ├── listings.js
│   │   │   ├── bookings.js
│   │   │   ├── payments.js
│   │   │   ├── reviews.js
│   │   │   ├── admin.js
│   │   │   └── uploadRoute.js
│   │   ├── database/                 # Database schemas
│   │   ├── server.js                 # Express app entry
│   │   └── seed.js                   # Database seeding
│   ├── .env                          # Environment variables
│   ├── package.json                  # Backend dependencies
│   └── .gitignore                    # Git ignore rules
│
├── package.json                       # Root workspace config
├── .env                              # Root env config
├── .env.example                      # Env template
├── .gitignore                        # Global git ignore
├── README.md                         # Main README
└── MONOREPO.md                       # This file
```

## 📦 Workspaces Setup

### Root `package.json`

The root `package.json` uses npm workspaces to manage both packages:

```json
{
  "name": "@uniboard/monorepo",
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace=frontend\" \"npm run dev --workspace=backend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspace=frontend"
  }
}
```

### Root monorepo config

There is also a root configuration file at `monorepo.config.js` that documents the workspace layout, package metadata, and environment files.

```js
module.exports = {
  name: '@uniboard/monorepo',
  workspaces: ['frontend', 'backend'],
  scripts: {
    dev: 'concurrently "npm run dev --workspace=frontend" "npm run dev --workspace=backend"',
    'dev:frontend': 'npm run dev --workspace=frontend',
    'dev:backend': 'npm run dev --workspace=backend',
    build: 'npm run build --workspace=frontend'
  },
  packages: {
    frontend: {
      name: '@uniboard/frontend',
      path: 'frontend'
    },
    backend: {
      name: '@uniboard/backend',
      path: 'backend'
    }
  }
}
```

### Package Names

- **Frontend**: `@uniboard/frontend` (in frontend/package.json)
- **Backend**: `@uniboard/backend` (in backend/package.json)

This allows internal references if needed.

## 🚀 Running the Project

### Install All Dependencies

```bash
# Install all packages and workspaces
npm install

# This runs:
# 1. npm install at root
# 2. npm install at frontend/
# 3. npm install at backend/
```

### Development Mode

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend    # http://localhost:5176
npm run dev:backend     # http://localhost:5000
```

### Production Build

```bash
# Build frontend
npm run build

# Frontend builds to: frontend/dist/

# Backend doesn't need build - run directly
npm start --workspace=backend
```

## 📋 Workspace Commands

### Using Workspaces

```bash
# Run script in specific workspace
npm run <script> --workspace=<package-name>

# Examples
npm run dev --workspace=frontend
npm start --workspace=backend

# Install package in workspace
npm install package-name --workspace=frontend
npm install --save-dev package-name --workspace=backend

# List all workspaces
npm workspaces list
```

### Frontend Workspace

```bash
# From root
npm run dev --workspace=frontend
npm run build --workspace=frontend
npm run lint --workspace=frontend

# Or from frontend/
cd frontend
npm run dev      # Same as above
```

### Backend Workspace

```bash
# From root
npm start --workspace=backend           # Production
npm run dev --workspace=backend         # Development (nodemon)
npm run seed --workspace=backend        # Seed database

# Or from backend/
cd backend
npm start        # Same as above
```

## 🔧 Development Workflow

### Adding Dependencies

#### To Frontend
```bash
npm install react-query --workspace=frontend
# Or
cd frontend && npm install react-query
```

#### To Backend
```bash
npm install express --workspace=backend
# Or
cd backend && npm install express
```

#### To Root (rare)
```bash
npm install -D eslint
```

### Creating New Features

1. **Frontend Feature**
   ```bash
   cd frontend/src
   # Create new component, page, hook, etc
   # Example: src/components/NewComponent.tsx
   ```

2. **Backend Feature**
   ```bash
   cd backend/src
   # Create controller, model, route, etc
   # Example: src/routes/newFeature.js
   ```

### Testing Across Packages

```bash
# Test frontend
npm run lint --workspace=frontend

# Test backend
npm start --workspace=backend

# Both should compile/run without errors
```

## 📚 Key Files Reference

### Frontend

| File | Purpose |
|------|---------|
| `frontend/vite.config.js` | Vite bundler configuration |
| `frontend/tsconfig.json` | TypeScript compiler options |
| `frontend/tailwind.config.js` | Tailwind CSS configuration |
| `frontend/src/main.jsx` | React app entry point |
| `frontend/src/App.jsx` | Root component + routing |
| `frontend/src/lib/api.ts` | Axios API client setup |
| `frontend/src/stores/authStore.ts` | Auth state (Zustand) |

### Backend

| File | Purpose |
|------|---------|
| `backend/src/server.js` | Express app entry point |
| `backend/src/config/db.js` | Database configuration |
| `backend/.env` | Backend environment variables |
| `backend/src/models/*.js` | Sequelize ORM models |
| `backend/src/routes/*.js` | API endpoint definitions |
| `backend/src/middleware/auth.js` | JWT authentication |

## 🔒 Environment Configuration

### Root `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Frontend `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend `backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=uniboard
JWT_SECRET=secret_key
CLOUDINARY_NAME=name
STRIPE_SECRET_KEY=key
```

## 🐛 Troubleshooting

### Dependencies Not Found
```bash
# Reinstall all
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

### Port Conflicts
- Frontend default: 5176
- Backend default: 5000
- Change in config files or `.env`

### Module Resolution Issues
- Check import paths use correct workspace references
- Verify TypeScript paths in `frontend/tsconfig.json`
- Clear `.vite` cache: `rm -rf frontend/.vite`

### Database Connection
- Ensure MySQL running locally
- Check `backend/.env` credentials
- Run seed script: `npm run seed --workspace=backend`

## 📖 Additional Resources

- [Frontend Documentation](./frontend/FRONTEND_TECH_STACK.md)
- [Frontend Quick Start](./frontend/FRONTEND_QUICK_START.md)
- [Main README](./README.md)

## 🔄 Git Workflow with Monorepo

### Committing Changes

```bash
# Changes to frontend only
git add frontend/
git commit -m "feat(frontend): add new component"

# Changes to backend only
git add backend/
git commit -m "feat(backend): add new API endpoint"

# Changes to both
git add frontend/ backend/
git commit -m "feat: add new feature across stack"

# Tooling changes
git add package.json tsconfig.json
git commit -m "chore: update build configuration"
```

### Branch Strategy

```bash
# Feature branch
git checkout -b feat/user-registration

# Bug fix
git checkout -b fix/auth-token-renewal

# Release
git checkout -b release/v1.0.0
```

## ✅ Common Tasks

### Update All Packages
```bash
npm update --workspace=frontend
npm update --workspace=backend
npm update
```

### Clean Build
```bash
npm run build --workspace=frontend
# dist/ folder created in frontend/
```

### Run Type Check
```bash
cd frontend
npx tsc --noEmit
```

### Seed Database
```bash
npm run seed --workspace=backend
```

## 📝 Best Practices

1. **Keep Workspaces Independent** - Don't share dependencies between frontend/backend unless necessary
2. **Clear Responsibility** - Frontend handles UI, Backend handles API
3. **Shared Configuration** - Environment and build configs at root
4. **Git Hygiene** - Commit changes by package/concern
5. **Documentation** - Keep local READMEs updated
6. **Testing** - Test each package independently
7. **Naming Convention** - Use scoped names: `@uniboard/frontend`, `@uniboard/backend`

---

**Happy coding! 🚀**
