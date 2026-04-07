# UniBoard Project Analysis

**Generated**: April 7, 2026

---

## 1. CURRENT STRUCTURE

### Architecture Overview
- **Monorepo** with npm workspaces (@uniboard/backend, @uniboard/frontend)
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **Backend**: Node.js/Express + Mixed ORM (Sequelize + Mongoose)
- **Database**: SQLite (dev) / MySQL (production)
- **Payment**: Stripe integration
- **File Storage**: Cloudinary for image uploads

### Backend Stack
```
Core: Express 5.2.1 + JWT authentication
Database Layer: 
  - Sequelize 6.35.2 (User, Property, Building, Compound, PropertyImage, PropertyFeature)
  - Mongoose (Booking, Payment, Listing, Review) ⚠️ MIXED ORM ISSUE
Security: bcrypt for passwords, JWT tokens
File Upload: Multer + Cloudinary
Payment: Stripe
```

### Current Endpoints (Implemented)
```
Authentication:
  POST   /api/auth/register           - User registration
  POST   /api/auth/login              - User login
  GET    /api/auth/me (protected)     - Get current user

Properties (Sequelize):
  GET    /api/properties              - List properties
  GET    /api/properties/:id          - Get property details
  POST   /api/properties (protected)  - Create property
  PUT    /api/properties/:id (protected) - Update property

Admin:
  GET    /api/admin/users             - List all users (admin only)
  PUT    /api/admin/users/:id         - Update user role (admin only)
  DELETE /api/admin/users/:id         - Delete user (admin only)
  GET    /api/admin/properties        - List pending properties (admin only)

Partial/Incomplete:
  POST   /api/bookings/request        - Create booking request
  POST   /api/bookings/:bookingId/upload-proof - Upload payment proof
  POST   /api/payments/create-intent  - Create Stripe payment intent
  POST   /api/upload/*                - File upload routes
```

### Models Map
```
SEQUELIZE (SQL):
- User (id, name, email, password, phone, role, isVerified)
- Property (id, name, description, location, price, room_type, building_id, landlord_id)
- PropertyImage (property_id, image_url)
- PropertyFeature (property_id, feature)
- Building (id, name, address, compound_id)
- Compound (id, name, location, landlord_id)

MONGOOSE (MongoDB):
- Booking (user, listing, status, paymentProofUrl, paymentProofType, rejectionReason)
- Payment (booking, user, listing, amount, currency, paymentMethod, status, stripePaymentIntentId)
- Listing (landlord, title, description, price, locationArea, images, roomType, amenities)
- Review (user, listing, rating, comment, verified)
```

### Frontend Structure
```
✅ TypeScript fully configured
✅ Zustand stores (authStore, uiStore) for state
✅ React Query configured for server state
✅ Axios API client with interceptors
✅ Zod validation schemas
✅ Custom hooks (useAuth)
✅ Error Boundary component
✅ Notification system
```

---

## 2. MISSING / INCOMPLETE BACKEND FEATURES

### 🔴 CRITICAL ISSUES

#### **Mixed ORM Architecture**
- **Problem**: Booking/Payment/Listing use Mongoose (MongoDB references)
- **But**: User/Property/Building use Sequelize (SQL references)
- **Impact**: 
  - Cross-model relationships broken (Booking.user references MongoDB ObjectId when User is in SQL)
  - Cannot perform proper joins
  - Data integrity issues
  - Unclear which database is authoritative
- **Fix**: Migrate all Mongoose models to Sequelize OR remove MongoDB entirely

#### **Controllers Missing**
- Controllers folder is empty
- All logic inline in route files
- Poor separation of concerns
- Code reusability issues

#### **Broken Booking/Payment Workflow**
- Booking model expects MongoDB ObjectIds but tries to reference SQL User
- Stripe payment intent creation but no webhook handling
- No confirmation logic in bookings
- No payment status synchronization

---

### 🟡 MISSING FEATURES

1. **Review System Implementation**
   - Review model exists but no routes implemented
   - No endpoints to create/get reviews
   - No rating aggregation
   - No review moderation

2. **Listings Management**
   - Listing model (Mongoose) not connected to Property model (Sequelize)
   - Duplicate property data in two different databases
   - No listing routes partially implemented (only inline in bookings)
   - Missing listing status management (approved/rejected)

3. **Role-Based Access Control**
   - ✅ Basic RBAC in middleware
   - ❌ No route-level permissions defined
   - ❌ No landlord-specific endpoints (edit own properties)
   - ❌ No student-specific booking validation
   - ❌ No admin property approval workflow

4. **Email/Notifications**
   - No email service configured
   - No verification emails
   - No booking confirmation notifications
   - No payment status notifications

5. **Search & Filtering**
   - Basic text search in properties
   - Missing: date range, price range, amenities, room type filters
   - No sorting options
   - No favorites/wishlist

6. **User Profiles**
   - No profile route for users
   - No profile update endpoint
   - No user verification status tracking
   - No profile picture/avatar support

7. **Analytics & Reporting**
   - No booking statistics
   - No revenue reports
   - No user activity logs
   - No property performance metrics

8. **Error Handling**
   - Inconsistent error responses
   - No proper error logging
   - No request validation middleware (no input sanitization)
   - Missing transaction rollback on failures

9. **File Upload**
   - Upload route exists but incomplete
   - No file size validation
   - No file type validation
   - No virus scanning
   - Cloudinary config might not be fully implemented

10. **Pagination**
    - No pagination on list endpoints
    - Could return unlimited records
    - Performance issue for large datasets

11. **Rate Limiting**
    - No rate limiting on endpoints
    - Vulnerable to brute force attacks

12. **Transactions & Data Consistency**
    - No database transactions
    - Booking + Payment creation could be partially complete
    - No rollback on payment failure

---

## 3. STEP-BY-STEP BUILD ROADMAP

### Phase 1: Fix Architecture (Week 1)

**1.1 Resolve ORM Conflict** (HIGHEST PRIORITY)
- [ ] Decide: MongoDB OR MySQL for all data?
- [ ] **Recommendation**: Use only MySQL (Sequelize) - simpler, already configured
- [ ] Migrate Mongoose models (Booking, Payment, Listing, Review) to Sequelize
- [ ] Remove all Mongoose references and `require('mongoose')`
- [ ] Create database migrations for new tables
- [ ] Update all foreign key relationships

**1.2 Implement Proper Project Structure**
- [ ] Create `/src/controllers` directory with proper separation
- [ ] Move all business logic from routes to controllers
- [ ] Create `/src/validations` for input validation schemas
- [ ] Create `/src/utils` for shared utilities
- [ ] Create `/src/services` for business logic (e.g., PaymentService, BookingService)

**1.3 Add Input Validation**
- [ ] Create validation middleware using express-validator or joi
- [ ] Validate all request bodies, params, queries
- [ ] Add sanitization (XSS prevention)
- [ ] Return standardized error responses

### Phase 2: Core Features (Week 2)

**2.1 Complete Booking Workflow**
- [ ] Full Booking model with proper relationships
- [ ] GET /api/bookings - List user's bookings
- [ ] GET /api/bookings/:id - Get booking details
- [ ] PUT /api/bookings/:id/confirm - Landlord confirms booking
- [ ] PUT /api/bookings/:id/reject - Landlord rejects booking
- [ ] Delete booking endpoint
- [ ] Status tracking (PENDING → CONFIRMED/REJECTED)

**2.2 Complete Payment Processing**
- [ ] Migrate Payment model to Sequelize
- [ ] POST /api/payments/stripe-webhook - Handle Stripe webhooks
- [ ] Payment status updates (pending → completed/failed)
- [ ] Payment receipt generation
- [ ] Refund functionality
- [ ] Payment history endpoint

**2.3 Complete Review System**
- [ ] Migrate Review model to Sequelize
- [ ] POST /api/reviews - Create review (only verified bookings)
- [ ] GET /api/reviews/property/:propertyId - Get property reviews
- [ ] PUT /api/reviews/:id - Update review (owner only)
- [ ] DELETE /api/reviews/:id - Delete review
- [ ] GET /api/properties/:id/rating - Calculate average rating
- [ ] Only allow reviews after booking completion

**2.4 Property Management**
- [ ] Create unified Property model (merge Property + Listing)
- [ ] POST /api/properties - Create property (landlord/admin)
- [ ] PUT /api/properties/:id - Update property (owner/admin)
- [ ] DELETE /api/properties/:id - Delete property (owner/admin)
- [ ] POST /api/properties/:id/approve - Admin approve listing
- [ ] GET /api/properties?status=pending - Pending approvals (admin)

### Phase 3: Enhanced Features (Week 3)

**3.1 User Management**
- [ ] GET /api/users/:id - Public profile
- [ ] PUT /api/users/profile - Update own profile
- [ ] PUT /api/users/password - Change password
- [ ] POST /api/users/verify-email - Email verification
- [ ] GET /api/users/:id/properties - User's listings
- [ ] GET /api/users/:id/bookings - User's bookings
- [ ] User ratings/reviews count

**3.2 Advanced Filtering & Search**
- [ ] GET /api/properties?price_min=100&price_max=500
- [ ] GET /api/properties?room_type=single&amenities=wifi,kitchen
- [ ] GET /api/properties?location=radius&lat=x&long=y&distance=10km
- [ ] Sorting: price ASC/DESC, rating, newest
- [ ] Pagination with limit/offset
- [ ] Full-text search capability

**3.3 Wishlist/Favorites**
- [ ] POST /api/favorites - Add to favorites
- [ ] DELETE /api/favorites/:propertyId - Remove favorite
- [ ] GET /api/favorites - Get all favorites
- [ ] Add to Property model: favorite count

**3.4 Notifications**
- [ ] Email service integration (SendGrid, nodemailer)
- [ ] POST /api/notifications/send
- [ ] GET /api/notifications - Get user notifications
- [ ] Mark as read/unread

### Phase 4: Security & Production (Week 4)

**4.1 Security Hardening**
- [ ] Rate limiting (express-rate-limit)
- [ ] Helmet.js for security headers
- [ ] CSRF protection
- [ ] SQL injection prevention (already partially done with ORM)
- [ ] JWT expiration and refresh tokens
- [ ] OAuth2 optional (Google/Apple login)

**4.2 Error Handling**
- [ ] Global error handler middleware
- [ ] Request logging (morgan)
- [ ] Error tracking (Sentry)
- [ ] 404 handler
- [ ] Async error wrapper

**4.3 Testing**
- [ ] Unit tests (Jest)
- [ ] Integration tests for auth endpoints
- [ ] Integration tests for payment flow
- [ ] E2E tests

**4.4 Deployment Ready**
- [ ] Environment configuration (.env validation)
- [ ] Database migration scripts
- [ ] Seed data script (updated to Sequelize)
- [ ] Documentation/API spec (Swagger/OpenAPI)
- [ ] CI/CD pipeline setup

### Phase 5: Frontend Integration (Week 5+)

**5.1 Connect All Endpoints**
- [ ] Update API client to match new routes
- [ ] Implement all pages with real data
- [ ] Form validation using Zod schemas
- [ ] Loading states, error handling

**5.2 Feature Pages**
- [ ] Property listing with filters
- [ ] Booking management page
- [ ] Payment integration (Stripe Elements)
- [ ] Review system UI
- [ ] Admin dashboard

---

## 4. SECURITY ISSUES & VULNERABILITIES

### 🔴 CRITICAL (Fix Immediately)

1. **JWT Secret Exposed Risk**
   ```javascript
   // ⚠️ VULNERABLE
   const token = jwt.sign({ userId }, process.env.JWT_SECRET)
   // What if env is logged or accessed?
   ```
   - **Fix**: Use strong 32+ character secret
   - **Fix**: Implement refresh token rotation
   - **Fix**: Never log sensitive values

2. **No Input Validation**
   - Currently accepting any request body
   - Vulnerable to NoSQL/SQL injection (partially mitigated by ORM)
   - No XSS prevention
   - No rate limiting
   - **Fix**: Add validation middleware on all routes

3. **Weak Password Requirements**
   ```javascript
   // Current: 8 characters minimum
   // ⚠️ TOO WEAK for sensitive data
   ```
   - **Fix**: Require min 12 characters, uppercase, lowercase, numbers, special chars
   - **Fix**: Check against common passwords (haveibeenpwned API)

4. **No CSRF Protection**
   - Express app has no CSRF tokens
   - Vulnerable to cross-site request forgery
   - **Fix**: Use csurf middleware

5. **Insufficient Authentication**
   - No email verification requirement
   - No account lockout after failed login attempts
   - No 2FA/MFA
   - JWT doesn't validate user still exists (only on /me endpoint)
   - **Fix**: Add email verification, rate limit login, implement 2FA

6. **Missing Authorization Checks**
   - No check if user can edit their own resources
   - Users could theoretically access others' data
   - **Example**: `PUT /api/properties/:id` doesn't verify ownership
   - **Fix**: Add middleware to check resource ownership

7. **No HTTPS/TLS Enforcement**
   - Server doesn't enforce HTTPS
   - Tokens could be intercepted
   - **Fix**: Add HSTS header, enforce HTTPS in production

8. **Cloudinary Keys Potentially Exposed**
   - Upload endpoint might expose API keys
   - **Fix**: Never expose API secrets to frontend
   - **Fix**: Use server-side signed URLs only

9. **No Request Logging/Audit Trail**
   - Cannot trace who did what and when
   - Security incident investigation impossible
   - **Fix**: Implement comprehensive logging

10. **Stripe Key Management**
    - Stripe secret key might be logged
    - No webhook signature verification visible
    - **Fix**: Verify signatures on all webhooks
    - **Fix**: Implement secure webhook handling

### 🟡 HIGH (Fix Soon)

11. **SQL Injection via ORM**
    - While Sequelize reduces risk, user input still goes to `Op.like` queries
    - **Current Code**:
      ```javascript
      { name: { [Op.like]: `%${search}%` } }
      // search not validated/escaped
      ```
    - **Fix**: Validate and sanitize search parameters

12. **No CORS Restrictions**
    ```javascript
    app.use(cors()); // ⚠️ Allows ANY origin
    ```
    - **Fix**: Whitelist specific origins:
      ```javascript
      cors({ origin: process.env.FRONTEND_URL })
      ```

13. **Weak File Upload Validation**
    - No file size limits checked
    - No file type validation
    - Could accept executable files
    - **Fix**: Validate MIME types, enforce size limits (5MB max), scan with antivirus

14. **Error Messages Too Verbose**
    ```javascript
    // ❌ VULNERABLE - Reveals database errors
    res.status(500).json({ message: error.message })
    ```
    - Attackers can use error messages to find vulnerabilities
    - **Fix**: Log errors server-side, return generic message to client

15. **No Rate Limiting**
    - Brute force attacks possible on /login
    - DoS attacks possible
    - **Fix**: Implement rate limiting on sensitive endpoints

16. **Password Stored with Weak Hash**
    - bcrypt without increased rounds (10 default is marginal)
    - **Fix**: Use 12+ salt rounds for bcrypt

17. **No Session Management**
    - If JWT is stolen, attacker has permanent access
    - No way to invalidate token without waiting expiry
    - **Fix**: Implement token blacklist or use short-lived tokens + refresh tokens

18. **Mixed ORM = Data Integrity Issues**
    - Foreign key constraints not enforced across databases
    - Orphaned records possible
    - **Fix**: Migrate to single database

### 🟢 MEDIUM (Plan to Fix)

19. **No API Rate Limiting** - Implement at reverse proxy/middleware level
20. **No API Versioning** - Could break clients with updates
21. **No API Documentation** - Security through obscurity is no security
22. **No Dependency Scanning** - npm audit for known vulnerabilities
23. **No Database Backup Strategy** - Data loss risk
24. **No Secrets Manager** - Env vars could be exposed in logs

---

## IMPLEMENTATION PRIORITY

### ✅ Do First (Security)
1. Validate all inputs
2. Fix JWT token handling (refresh tokens)
3. Fix CORS to specific origins
4. Add rate limiting
5. Add CSRF protection
6. Fix HTTPS in production

### ✅ Do Second (Architecture)
1. Resolve ORM conflict (SQL only)
2. Implement proper controller/service structure
3. Add global error handling
4. Add request logging

### ✅ Do Third (Features)
1. Complete booking workflow with proper data model
2. Complete payment with webhook handling
3. Complete review system
4. User profile endpoints

### ✅ Do Last (Polish)
1. Advanced search/filtering
2. Wishlist/favorites
3. Analytics
4. Email notifications

---

## ESTIMATED EFFORT

| Phase | Duration | Complexity | Priority |
|-------|----------|-----------|----------|
| Fix Architecture | 3-4 days | HIGH | CRITICAL |
| Core Features | 4-5 days | MEDIUM | HIGH |
| Enhanced Features | 3-4 days | MEDIUM | MEDIUM |
| Security Hardening | 2-3 days | HIGH | CRITICAL |
| Testing | 3-4 days | MEDIUM | HIGH |
| Frontend Integration | 5-7 days | MEDIUM | HIGH |

**Total Estimate**: 4-5 weeks for production-ready system

---

## QUICK WINS (Can Do This Week)

1. **Add Input Validation** (~1 hour)
   - Use express-validator on all routes
   - Catches basic attacks immediately

2. **Fix CORS** (~30 min)
   - Restrict to frontend URL only
   - Prevents CSRF

3. **Add Rate Limiting** (~30 min)
   - Protects login endpoint
   - Prevents brute force

4. **Add Helmet** (~15 min)
   - Adds security headers
   - Minimal setup, big impact

5. **Add Request Logging** (~1 hour)
   - Use morgan middleware
   - Helps with debugging and security

6. **Create Controllers** (~2 hours)
   - Extract logic from routes
   - Improves code quality immediately

---

## RECOMMENDED NEXT STEPS

1. **Today**: Schedule 30-min meeting to decide: MongoDB or MySQL? (Currently broken both)
2. **This Sprint**: 
   - Start with Architecture cleanup (ORM decision)
   - Add validation & rate limiting (quick wins)
   - Implement proper controller structure
3. **Next Sprint**:
   - Complete booking & payment workflows
   - Add proper error handling
   - Implement review system

