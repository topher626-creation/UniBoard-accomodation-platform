# UniBoard Accommodation Platform: Project Overview

## 1. Introduction

The UniBoard Accommodation Platform is designed as a comprehensive marketplace to connect students with landlords for accommodation. It is structured as a monorepo, encompassing both frontend and backend applications, built with modern web technologies and best practices [1].

## 2. Architecture and Tech Stack

The project employs a monorepo architecture, separating the frontend and backend into distinct packages. This approach facilitates independent development and deployment while maintaining a unified codebase.

### 2.1 Frontend

The frontend is a React 19 application built with TypeScript, utilizing Vite as a build tool and Tailwind CSS for styling. Key libraries and frameworks include:

| Category           | Technology        | Purpose                                   |
| :----------------- | :---------------- | :---------------------------------------- |
| UI Library         | React 19          | Building user interfaces                  |
| Type Safety        | TypeScript        | Enhancing code quality and maintainability |
| Build Tool         | Vite              | Fast development and optimized builds     |
| Styling            | Tailwind CSS      | Utility-first CSS framework               |
| Routing            | React Router      | Client-side navigation                    |
| Server State Mgmt. | React Query       | Managing asynchronous data fetching       |
| Client State Mgmt. | Zustand           | Global state management                   |
| Form Handling      | React Hook Form   | Efficient form management                 |
| Schema Validation  | Zod               | Data validation                           |
| Component Library  | Next UI           | Pre-built UI components                   |
| Animations         | Framer Motion     | Declarative animations                    |
| HTTP Client        | Axios             | Making HTTP requests                      |

The frontend structure includes dedicated directories for components, pages, hooks, state stores, utility functions, and type definitions [1].

### 2.2 Backend

The backend is a Node.js application built with Express.js, designed to provide a robust API for the frontend. The primary database is MySQL for production and SQLite for development. Key technologies include:

| Category           | Technology        | Purpose                                   |
| :----------------- | :---------------- | :---------------------------------------- |
| Runtime            | Node.js           | Server-side JavaScript execution          |
| Web Framework      | Express.js        | Building RESTful APIs                     |
| ORM                | Sequelize         | Object-Relational Mapping for SQL databases |
| Database (Prod)    | MySQL             | Relational database for production        |
| Database (Dev)     | SQLite            | Lightweight database for development      |
| Authentication     | JWT               | Token-based user authentication           |
| Password Hashing   | Bcryptjs          | Secure password storage                   |
| File Uploads       | Multer, Cloudinary | Handling file uploads and storage         |
| Payments           | Stripe            | Payment processing integration            |

The backend follows a structured approach with modules for configuration, controllers, middleware, models, and routes [1].

## 3. Core Features

The UniBoard platform aims to provide a comprehensive set of features for both students and landlords, as well as administrative functionalities:

*   **User Authentication**: JWT-based authentication with a role system (Student, Landlord, Admin) [1].
*   **Role-Based Access**: Differentiated access levels for various user roles [1].
*   **Property Management**: Landlords can create, edit, and list properties. Admins can approve properties [1, 5].
*   **Booking System**: Students can book properties, and landlords can manage bookings (confirm, reject, cancel) [1, 6].
*   **Reviews & Ratings**: Users can review properties and landlords [1].
*   **Payment Integration**: Stripe integration for secure payment processing [1].
*   **File Uploads**: Cloudinary integration for image storage, particularly for property images and verification documents [1, 7].
*   **Search & Filter**: Functionality to search for properties by location, price, room type, and availability [1, 5].
*   **Admin Dashboard**: Administrative functions for user management, property moderation, and basic analytics [1, 8].

## 4. Current State and Identified Issues

An analysis of the codebase reveals several critical and high-priority issues that need to be addressed to ensure the platform's stability, security, and completeness [2].

### 4.1 Critical Issues

1.  **Mixed ORM Architecture**: The backend currently uses both Sequelize (for User, Property, Building, Compound, PropertyImage, PropertyFeature) and Mongoose (for Booking, Payment, Listing, Review). This mixed ORM approach leads to broken cross-model relationships, data integrity issues, and makes it unclear which database is authoritative. The recommendation is to migrate all Mongoose models to Sequelize to use only MySQL [2].
2.  **Missing Controllers**: The `controllers` directory in the backend is empty, with all business logic inline within route files. This violates the principle of separation of concerns and hinders code reusability [2].
3.  **Broken Booking/Payment Workflow**: The booking model expects MongoDB ObjectIds while referencing SQL users, leading to inconsistencies. Stripe payment intent creation lacks webhook handling, confirmation logic, and payment status synchronization [2].

### 4.2 Missing Features (High Priority)

1.  **Review System Implementation**: While a Review model exists, routes for creating, retrieving, updating, and deleting reviews are not fully implemented. Rating aggregation and moderation are also missing [2].
2.  **Listings Management**: The `Listing` model (Mongoose) is not properly connected to the `Property` model (Sequelize), leading to duplicate data. Comprehensive listing status management (approved/rejected) is also absent [2].
3.  **Role-Based Access Control (RBAC)**: Basic RBAC is present in middleware, but route-level permissions are not fully defined. Landlord-specific endpoints and admin property approval workflows are incomplete [2].
4.  **Email/Notifications**: The platform lacks email services for verification, booking confirmations, and payment status updates [2].
5.  **Advanced Search & Filtering**: While basic search exists, advanced filters for date range, amenities, and comprehensive sorting options are missing [2].
6.  **User Profiles**: Dedicated routes for public profiles, profile updates, password changes, and email verification are not fully implemented [2].
7.  **Error Handling**: Inconsistent error responses, lack of proper error logging, and missing request validation middleware are present [2].
8.  **File Upload Validation**: The upload route lacks file size and type validation, making it vulnerable to malicious uploads [2].
9.  **Pagination**: Many list endpoints lack pagination, which could lead to performance issues with large datasets [2].
10. **Rate Limiting**: Endpoints are not rate-limited, making them vulnerable to brute-force attacks [2].
11. **Transactions & Data Consistency**: Lack of database transactions means that multi-step operations like booking and payment creation could be partially complete without rollback mechanisms [2].

### 4.3 Security Vulnerabilities

Several critical security vulnerabilities have been identified [2]:

*   **JWT Secret Exposure Risk**: Potential exposure of the JWT secret if environment variables are logged or accessed.
*   **No Input Validation**: Vulnerability to SQL/NoSQL injection and XSS due to lack of validation middleware.
*   **Weak Password Requirements**: Passwords with a minimum length of 8 characters are considered too weak.
*   **No CSRF Protection**: Vulnerability to Cross-Site Request Forgery attacks.
*   **Insufficient Authentication**: Missing email verification, account lockout mechanisms, and 2FA/MFA.
*   **Missing Authorization Checks**: Lack of checks for resource ownership, allowing potential unauthorized access to other users' data.
*   **No HTTPS/TLS Enforcement**: Server does not enforce HTTPS, making tokens vulnerable to interception.
*   **Cloudinary Keys Potentially Exposed**: Upload endpoints might expose API keys.
*   **No Request Logging/Audit Trail**: Absence of comprehensive logging makes security incident investigation difficult.
*   **Stripe Key Management**: Potential logging of Stripe secret keys and lack of webhook signature verification.
*   **SQL Injection via ORM**: While Sequelize mitigates some risks, user input in `Op.like` queries is not validated/escaped.
*   **No CORS Restrictions**: `app.use(cors())` allows any origin, posing a security risk.
*   **Weak File Upload Validation**: Lack of file size and type validation for uploaded files.

## 5. Roadmap for Development

The project analysis outlines a phased roadmap for addressing the identified issues and implementing missing features [2]:

### Phase 1: Fix Architecture (Week 1)

*   **Resolve ORM Conflict**: Migrate all Mongoose models to Sequelize, remove Mongoose references, create database migrations, and update foreign key relationships.
*   **Implement Proper Project Structure**: Create `controllers`, `validations`, `utils`, and `services` directories, moving business logic and validation schemas to their appropriate locations.
*   **Add Input Validation**: Implement validation middleware using libraries like `express-validator` or `joi` for all request bodies, parameters, and queries.

### Phase 2: Core Features (Week 2)

*   **Complete Booking Workflow**: Implement full booking model with proper relationships, endpoints for listing, retrieving, confirming, rejecting, and canceling bookings, and status tracking.
*   **Complete Payment Processing**: Migrate the Payment model to Sequelize, implement Stripe webhook handling, payment status updates, receipt generation, refund functionality, and payment history endpoints.
*   **Complete Review System**: Migrate the Review model to Sequelize, implement CRUD operations for reviews, and calculate average ratings.
*   **Property Management**: Create a unified Property model, implement CRUD operations for properties, and add admin approval workflows.

### Phase 3: Enhanced Features (Week 3)

*   **User Management**: Implement public profile views, profile updates, password changes, email verification, and endpoints for user-specific listings and bookings.
*   **Advanced Filtering & Search**: Implement advanced search capabilities with filters for price range, room type, amenities, location radius, and sorting options.
*   **Wishlist/Favorites**: Implement functionality for users to add, remove, and view favorited properties.
*   **Notifications**: Integrate an email service for various notifications.

### Phase 4: Security & Production (Week 4)

*   **Security Hardening**: Implement rate limiting, Helmet.js for security headers, CSRF protection, JWT expiration and refresh tokens, and optional OAuth2 integration.
*   **Error Handling**: Implement global error handler middleware, request logging, error tracking, and a 404 handler.
*   **Testing**: Implement unit, integration, and end-to-end tests.
*   **Deployment Ready**: Ensure environment configuration, database migration scripts, updated seed data, and API documentation are in place.

### Phase 5: Frontend Integration (Week 5+)

*   **Connect All Endpoints**: Update the frontend API client to match new backend routes and implement all pages with real data, including form validation, loading states, and error handling.
*   **Feature Pages**: Develop UI for property listings with filters, booking management, Stripe payment integration, review system, and admin dashboard.

## References

[1] [UniBoard-accomodation-platform/README.md](file:///home/ubuntu/UniBoard-accomodation-platform/README.md) (README.md)
[2] [UniBoard-accomodation-platform/PROJECT_ANALYSIS.md](file:///home/ubuntu/UniBoard-accomodation-platform/PROJECT_ANALYSIS.md) (PROJECT_ANALYSIS.md)
[3] [UniBoard-accomodation-platform/backend/src/server.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/server.js) (server.js)
[4] [UniBoard-accomodation-platform/backend/src/models/index.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/models/index.js) (index.js)
[5] [UniBoard-accomodation-platform/backend/src/routes/properties.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/routes/properties.js) (properties.js)
[6] [UniBoard-accomodation-platform/backend/src/routes/bookings.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/routes/bookings.js) (bookings.js)
[7] [UniBoard-accomodation-platform/backend/src/routes/uploadRoute.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/routes/uploadRoute.js) (uploadRoute.js)
[8] [UniBoard-accomodation-platform/backend/src/routes/admin.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/routes/admin.js) (admin.js)
[9] [UniBoard-accomodation-platform/frontend/src/App.jsx](file:///home/ubuntu/UniBoard-accomodation-platform/frontend/src/App.jsx) (App.jsx)
[10] [UniBoard-accomodation-platform/frontend/src/lib/api.ts](file:///home/ubuntu/UniBoard-accomodation-platform/frontend/src/lib/api.ts) (api.ts)
[11] [UniBoard-accomodation-platform/frontend/FRONTEND_QUICK_START.md](file:///home/ubuntu/UniBoard-accomodation-platform/frontend/FRONTEND_QUICK_START.md) (FRONTEND_QUICK_START.md)
[12] [UniBoard-accomodation-platform/backend/src/routes/auth.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/routes/auth.js) (auth.js)
[13] [UniBoard-accomodation-platform/backend/src/models/User.js](file:///home/ubuntu/UniBoard-accomodation-platform/backend/src/models/User.js) (User.js)
