# UniBoard Student Accommodation Platform

A comprehensive student accommodation marketplace connecting students with landlords. Built with modern web technologies and best practices.

## 🏗️ Project Structure

This is a **monorepo** project containing both frontend and backend applications in separate packages:

```
uniboard-accommodation-platform/
├── frontend/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Route pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── stores/             # Zustand state stores
│   │   ├── lib/                # Utility functions & APIs
│   │   ├── types/              # TypeScript type definitions
│   │   ├── assets/             # Static assets
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                 # Public static files
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                    # Frontend environment variables
│   └── FRONTEND_QUICK_START.md # Frontend guide
│
├── backend/                     # Node.js + Express backend API
│   ├── src/
│   │   ├── config/             # Configuration files (database, etc)
│   │   ├── controllers/        # Request handlers (business logic)
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Sequelize/ORM models
│   │   ├── routes/             # API route definitions
│   │   ├── database/           # Database schemas & migrations
│   │   ├── server.js           # Express app entry point
│   │   └── seed.js             # Database seeding script
│   ├── .env                    # Backend environment variables
│   └── package.json
│
├── .env                        # Root environment configuration
├── .env.example                # Environment template
├── .gitignore
├── package.json                # Root workspace configuration
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MySQL 8+ (for production) or SQLite (development)

### Installation

```bash
# Install dependencies for all packages
npm install

# Or install specific package
npm install --workspace=frontend
npm install --workspace=backend
```

### Development

**Start both frontend and backend:**
```bash
npm run dev
```

**Start frontend only:**
```bash
npm run dev:frontend
# Frontend: http://localhost:5176
```

**Start backend only:**
```bash
npm run dev:backend
# Backend: http://localhost:5000
```

### Production Build

```bash
# Build frontend for production
npm run build

# Backend doesn't need build (Node.js runs directly)
npm start --workspace=backend
```

## 📦 Workspaces

This project uses npm workspaces for monorepo management:

```bash
# Run commands in specific workspace
npm run <script> --workspace=frontend
npm run <script> --workspace=backend

# Example
npm install express --workspace=backend
```

## 🔧 Environment Variables

### Root `./env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Frontend `./frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend `./backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=uniboard
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_key
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Next UI** - Component library
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Sequelize** - ORM
- **MySQL** - Database (production)
- **SQLite** - Database (development)
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Stripe** - Payments

## 📚 Documentation

- [Frontend Tech Stack](./frontend/FRONTEND_TECH_STACK.md) - Detailed frontend architecture
- [Frontend Quick Start](./frontend/FRONTEND_QUICK_START.md) - Frontend development guide

## 🚀 Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend    # Start frontend only
npm run dev:backend     # Start backend only
npm run build           # Build frontend
npm run lint            # Lint frontend
npm run seed            # Seed database
npm start:backend       # Start backend production
```

### Frontend (npm run <script> --workspace=frontend)
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend (npm run <script> --workspace=backend)
```bash
npm start   # Start server
npm run dev # Start with nodemon (hot reload)
npm run seed # Populate database
```

## 🔐 Features

- **User Authentication** - JWT-based auth with role system
- **Role-Based Access** - Student, Landlord, Admin roles
- **Property Management** - Create, edit, list properties
- **Booking System** - Book properties, manage bookings
- **Reviews & Ratings** - Review properties and landlords
- **Payment Integration** - Stripe integration for bookings
- **File Uploads** - Cloudinary integration for images
- **Search & Filter** - Find properties by location, price, etc.
- **Admin Dashboard** - Administrative functions

## 🔄 Development Workflow

### Adding Dependencies

```bash
# Frontend
npm install package-name --workspace=frontend

# Backend
npm install package-name --workspace=backend
```

### File Structure Convention

**Frontend:**
- Components in `src/components/` as `.tsx` files
- Pages in `src/pages/` as `.jsx` files
- Hooks in `src/hooks/` as `.ts` files
- Store in `src/stores/` as `.ts` files
- Types in `src/types/` as `.ts` files

**Backend:**
- Routes in `src/routes/`
- Models in `src/models/`
- Controllers in `src/controllers/`
- Middleware in `src/middleware/`
- Config in `src/config/`

## 📋 Git Strategy

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes to frontend or backend
# Commit grouped by package

git add frontend/src/...
git commit -m "feat(frontend): add new feature"

git add backend/src/...
git commit -m "feat(backend): add new feature"

# Push and create pull request
git push origin feature/feature-name
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Module Not Found
- Ensure dependencies are installed: `npm install`
- Check import paths use correct aliases
- Verify tsconfig/vite config paths

### Database Connection Error
- Verify MySQL is running
- Check `.env` credentials
- Ensure database exists or create with seed script

### CORS Errors
- Check backend CORS configuration
- Verify `VITE_API_URL` in frontend `.env`
- Ensure backend is running on correct port

## 🤝 Contributing

1. Create a feature branch
2. Make changes (frontend and/or backend)
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

SiameChristopher

---

**Happy Coding! 🎉**
