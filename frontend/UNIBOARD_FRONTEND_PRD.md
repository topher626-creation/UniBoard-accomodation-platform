# UniBoard Frontend PRD

## 1. Product Goal

Deliver a polished, production-ready UniBoard frontend for student accommodation discovery and provider management using the existing monorepo stack.

This frontend must:
- Use **Bootstrap 5 only** for layout and UI implementation
- Use the existing **React + Vite + React Router + Zustand + React Query + Axios** stack
- Support a **global light/dark theme**
- Standardize all user-facing wording to **bedspace**
- Use **off-campus** spelling consistently
- Keep the experience modular, reusable, and implementation-ready
- Avoid Tailwind usage entirely, even though legacy dev dependencies exist

## 2. Mandatory Technical Constraints

### Required stack
- React 19
- React Router DOM 7
- Bootstrap 5 / React-Bootstrap
- Zustand
- Axios
- React Query
- Zod + React Hook Form where forms are refactored or improved
- Framer Motion and lucide-react only if already beneficial to polish

### Explicit rules
- **No Tailwind classes in implementation**
- **Do not add new libraries**
- Use **React Query** for server-state driven pages and dynamic datasets
- Keep UI components reusable and Bootstrap-first
- Minimize inline styles; move reusable visual rules into shared CSS
- Preserve existing route structure unless explicitly extending with compatible fallbacks

## 3. Current Frontend Audit Summary

### What already exists
- Global app shell with Navbar + Footer in `frontend/src/App.jsx`
- Core routes:
  - `/`
  - `/about`
  - `/help`
  - `/login`
  - `/register`
  - `/properties`
  - `/property/:id`
  - `/create-listing`
  - `/landlord`
  - `/admin`
- Existing auth modal with role-based registration flow
- Existing home page with hero, search, filters, listings, CTA
- Existing about/help page with tabbed structure and FAQ accordion
- Existing landlord and admin dashboards
- Existing global theme tokens in `frontend/src/styles/global.css`

### Main gaps vs final polished spec
1. **Data layer mismatch on discovery pages**
   - Home currently uses `useState/useEffect` fetch patterns instead of React Query.
   - Dynamic frontend collections such as campus popularity are not represented and would need DB-backed fetches.

2. **Terminology inconsistency**
   - Some UI still says:
     - property
     - room
     - beds
     - list property
   - Final experience must prefer:
     - **bedspace**
     - **listing**
     - **Shared Bedspace** instead of any bunker-style wording
     - **off-campus**

3. **Home search/filter behavior is not yet production-grade**
   - Filters are local state only.
   - URL query params are not kept in sync.
   - Filter application is button-driven rather than fully live.
   - No explicit support for DB-driven “popular campuses”.

4. **Navbar behavior is close but incomplete**
   - Existing custom offcanvas works, but needs final UX rules and cleaner state contract.
   - Theme toggle icon logic is reversed from typical expectation.
   - Desktop/mobile nav labels still use mixed terminology such as “List Property”.

5. **Auth strategy is only partially aligned**
   - Modal flow exists and is valuable.
   - Route fallback pages `/login` and `/register` exist, but hybrid behavior needs to be formalized:
     - modal-first on navbar actions
     - route fallback for deep links and protected redirects
   - Student/provider flows need explicit field and state definitions tied to backend role/status assumptions.

6. **Property cards need spec alignment**
   - Availability labels currently use `Available / Limited / Full`.
   - Final spec calls for low/medium/high style availability communication and bedspace wording consistency.
   - Card metadata still shows “beds” rather than bedspaces.

7. **Landlord dashboard is functional but not fully spec-driven**
   - Max 3 listings limit exists, which matches requested rule.
   - Needs clearer affordances, wording cleanup, lock/pending messaging, and polished add/delete constraints.
   - Empty, limit, and pending states need more explicit UX.

8. **Admin dashboard logic is too generic**
   - User table is currently “users”, not specifically structured around landlord/provider moderation.
   - Status model partially supports `Active / Pending / Disabled` but needs formalized logic.
   - “Lock mode” is not clearly represented in UI behavior.
   - Approval/moderation actions need clearer business rules in frontend.

9. **About/help/services and footer need content structure enforcement**
   - About page already has a strong base but needs final PRD structure and wording standardization.
   - Footer exists but must follow final rules: strong 3-column desktop structure, stacked mobile, provider/student/help/contact priorities, and production-safe links/content.

10. **Design system is partially there but not formalized**
   - Global tokens exist.
   - Needs a defined component language for cards, badges, forms, surface elevation, spacing, and dark mode behavior.

## 4. Information Architecture

## Primary routes
- `/` → Home / Browse bedspaces
- `/properties` → Same search/browse experience as home with persisted filters
- `/property/:id` → Bedspace listing detail
- `/about` → About / Services / How it works
- `/help` → Help center state or anchored About help section
- `/login` → Route-based auth fallback
- `/register` → Route-based auth fallback
- `/create-listing` → Provider create listing flow
- `/landlord` → Provider dashboard
- `/admin` → Admin dashboard

## Shared shell
- Fixed top navbar on all pages
- Footer on all pages
- Main content padded for fixed navbar height
- Global notification system retained

## 5. Global UX Principles

- Clean, modern student-housing marketplace feel
- Trust-first UI: verified, clear, safe, not noisy
- Fast scanning: prominent cards, concise metadata, clear status badges
- Mobile-first, then refined desktop spacing
- Strong contrast in both light and dark modes
- Use polished Bootstrap spacing, cards, pills, dropdowns, tabs, tables, and offcanvas patterns
- Avoid emoji-heavy production implementation except where explicitly kept as placeholder during transition

## 6. Design System Requirements

### Typography
- Primary font: **Inter**
- Optional secondary accent/headline font: **Poppins**
- Consistent hierarchy:
  - Hero title
  - Section title
  - Card title
  - Supporting body
  - Meta/helper copy

### Color/token system
Must be centralized in shared global CSS variables and support both themes:
- Brand primary
- Secondary/muted
- Success
- Warning
- Danger
- Info
- Surface background
- Elevated card background
- Border/subtle divider
- Text primary
- Text muted

### Theme
- Global light/dark mode toggle from navbar
- Theme persisted in `localStorage`
- Theme applied via root attribute, e.g. `data-theme`
- All core surfaces must react correctly:
  - body
  - navbar
  - cards
  - dropdowns
  - offcanvas
  - forms
  - tables
  - accordion
  - footer
  - badges

### Reusable visual patterns
- Card hover lift, not exaggerated scale
- Rounded corners consistent across cards/forms/buttons
- Subtle shadows
- Clean section spacing
- No messy inline styles except truly one-off calculations

## 7. Content and Wording Standards

### Use these terms everywhere
- **bedspace** instead of room
- **listing** instead of property where user-facing context is marketplace-related
- **Shared Bedspace** instead of “2 bunker” or similar wording
- **off-campus** with hyphen
- **provider** when referring collectively to landlords/agents
- **landlord** only where the role is explicitly landlord-oriented

### Replace/avoid
- “List Property” → “List Bedspace” or “Create Listing”
- “Single Room” → “Single Bedspace” if product meaning is bedspace-focused
- “beds available” → “bedspaces available”
- “No Properties Found” → “No bedspaces found”

## 8. Home / Browse Experience PRD

## Purpose
Help students discover verified off-campus bedspaces quickly and confidently.

## Required sections
1. **Hero**
   - Clear headline about finding verified off-campus student bedspaces
   - Search input prominently placed
   - Secondary supporting copy emphasizing trust and direct provider contact
   - One primary CTA for browsing/searching
   - One provider CTA for listing bedspaces

2. **Quick filters**
   - Fast-select pills/chips for common listing types and availability
   - Bootstrap pills/buttons only

3. **Advanced filters**
   - Search
   - Campus/university
   - Location/area/compound
   - Bedspace type
   - Price min/max
   - Availability only
   - Optional gender preference if supported by backend data shape
   - Sort selection if available

4. **Popular near campus / campus popularity**
   - Must be **dynamic from DB**
   - Must **not** be hardcoded in frontend
   - Should be fetched via API and cached with React Query
   - Intended output: popular campuses and/or areas students browse most

5. **Listings grid**
   - Responsive card grid
   - Uses reusable `PropertyCard` component or renamed equivalent if parent agent refactors
   - Clear empty/loading/error states

6. **Provider promo section**
   - Dedicated landlord/provider conversion section
   - Explain limited listing workflow, visibility, and trust benefits
   - CTA should open register modal when possible, with route fallback

## Functional requirements
- Search/filter state must sync with **URL query params**
- Home and `/properties` should behave as the same browse experience
- Filtering should feel **live**
  - On change, update params
  - Refetch through React Query
- Use debouncing for free-text search if implemented, but no new library required
- Query params should be shareable and restorable on reload
- Loading states should use skeleton/spinner + preserved layout
- Results count visible
- Empty state must suggest clearing filters

## Gap notes from current implementation
- Current page fetches imperatively, not via React Query
- No URL param sync
- No DB-driven campus popularity
- Copy still mixes room/property terminology

## 9. Listing Card PRD

## Card content
Each listing card should show:
- Primary image
- Listing name/title
- Campus or nearby area
- Compound/location
- Price per month
- Bedspace type badge
- Availability badge
- Optional provider name when required by context
- Quick trust marker if verified/approved

## Availability badges
Frontend should normalize backend values into user-facing bands:
- **High availability**
- **Medium availability**
- **Low availability**

Implementation note:
- Parent/dashboard agent will align exact property fields, but frontend should be prepared to map either:
  - explicit status values, or
  - computed thresholds from available vs total bedspaces

Avoid “Limited/Full” wording in final card UI unless backend forces temporary fallback.

## Card behavior
- Entire card clickable to detail page
- Hover state subtle
- Image fallback supported
- Dark mode compatible
- Consistent height in listing grids

## Wording rules
- Show **bedspaces available**
- Use **Shared Bedspace** where relevant
- Avoid “beds” or “rooms” unless a backend payload label must be transformed

## 10. Navbar / Navigation PRD

## Desktop navbar
Must include:
- Brand/logo
- Home
- About
- Help
- Browse bedspaces
- Provider CTA (`Create Listing` or `List Bedspace`) when appropriate
- Theme toggle
- Auth actions or user menu

## Mobile navigation
- Custom offcanvas behavior is acceptable and already exists
- Offcanvas should:
  - slide from end/right
  - close on route navigation
  - close on auth modal open
  - include primary nav, theme toggle, and auth actions
- Body scroll/overlay behavior should be polished to match Bootstrap expectations

## Auth in navbar
Hybrid auth strategy:
- Navbar buttons open **AuthModal**
- If user lands directly on `/login` or `/register`, route pages remain usable as fallback
- Protected route redirect should still point to route fallback when modal cannot be assumed

## User menu
- Profile placeholder only if route exists; otherwise avoid broken links
- Provider dashboard for landlord/provider role
- Admin dashboard for admin role
- Logout

## Gap notes from current implementation
- Existing offcanvas and modal-first auth are good foundations
- Labels still need wording cleanup
- `/profile` link appears without confirmed route in `App.jsx`
- Theme icon text behavior needs cleanup
- Desktop nav lacks explicit browse/help parity

## 11. Authentication PRD

## Auth model
Use a **hybrid auth experience**:
1. **Modal-first**
   - Triggered from navbar or contextual CTAs
2. **Route fallback**
   - `/login`
   - `/register`

## Login flow
Fields:
- Email
- Password

Behavior:
- Submit via existing auth store/API
- Show inline error message
- Close modal on success
- Redirect based on role where appropriate

## Registration flow
Step 1:
- Choose account type:
  - Student
  - Provider

### Student signup flow
Fields:
- Full name
- Email
- Phone
- University/campus
- Gender if required by product
- Password
- Confirm password

Outcome:
- Account created as student
- Can immediately browse and save intent flows
- Redirect to home or preserved destination

### Provider signup flow
Fields:
- Full name
- Email
- Phone
- Password
- Confirm password
- Optional provider subtype label (landlord/agent) if backend supports it

Outcome:
- Account created as provider/landlord role according to backend contract
- Initial moderation state should be represented as **Pending**
- Provider may access dashboard with pending/locked restrictions depending on admin state

## Validation expectations
- Client-side password confirmation
- Minimum password length already exists; stronger validation can be layered using current stack
- Display request errors clearly
- Preserve role-step UX in modal

## Gap notes from current implementation
- Existing modal already supports student/provider branching
- Student flow includes static university list; final implementation should avoid hardcoded popularity assumptions and can later use dynamic campus data where feasible
- Provider card sets “agent” but currently writes landlord role; needs explicit documented backend alignment
- Route fallback behavior should be intentionally mirrored, not visually inconsistent

## 12. Provider / Landlord Dashboard PRD

## Purpose
Allow providers to manage listings and booking activity within a simplified capped workflow.

## Dashboard sections
1. Header / welcome area
2. Stats cards
3. Listing cap indicator
4. Listings management tab
5. Booking requests tab
6. Account status / lock messaging when applicable

## Listings rules
- **Maximum 3 active listings per provider**
- UI must make this obvious:
  - count display `x / 3`
  - add-new affordance when below limit
  - disabled/locked creation affordance when at limit
- Delete action must remain available so provider can free a slot
- Empty state should encourage first listing creation

## Listing card behavior in dashboard
Each provider listing card should show:
- Approval status
- Availability summary
- Price
- Location/campus
- View action
- Delete action
- Edit action only if route/function exists; otherwise do not invent

## Lock mode
Frontend must support a provider lock state concept for moderation/compliance:
- If provider status is disabled/locked by admin:
  - show locked state hero/alert
  - disable create listing action
  - disable approval-sensitive actions as required
  - preserve visibility into existing listings, but mark management restrictions clearly
- If provider status is pending:
  - show pending review notice
  - listing creation may be restricted based on backend rules; frontend should reflect returned permissions

## Booking management
- Pending requests visible first
- Confirm/reject actions
- Status badges
- Empty state support

## Gap notes from current implementation
- 3-listing cap is already present
- Terminology still says property/properties
- No explicit lock mode UX
- Add-new affordance exists but is visually basic
- Need stronger pending/approval messaging

## 13. Admin Dashboard PRD

## Purpose
Allow admins to moderate providers and listings with clear operational states.

## Core tabs
1. Overview
2. Providers/Landlords
3. Listings

## Provider moderation table
The provider-focused table should display:
- Name
- Email
- Phone if available
- Role/subtype if available
- Listing count
- Status
- Actions

## Provider status logic
Normalize UI to these user-facing states:
- **Active**
- **Pending**
- **Disabled**

Suggested frontend mapping:
- `is_banned === true` → Disabled
- `role/status indicates pending` or `is_verified === false` for provider → Pending
- verified, not banned provider → Active

This logic should be documented and used consistently in badges, filters, and lock behavior.

## Lock mode
Admin should be able to place provider into disabled/locked state.
Frontend meaning:
- Provider cannot actively manage listings normally
- Create listing CTA hidden or disabled on provider side
- Existing listings can be reviewed/admin-managed

If backend only exposes ban/unban currently, frontend can treat:
- banned = locked/disabled

## Listing moderation
Admin listings table should support:
- View listing basics
- Provider name
- Location
- Price
- Approval status
- Approve action for pending items
- Delete/remove action

## Gap notes from current implementation
- Current dashboard is generic “Users”
- Needs explicit provider/landlord management framing
- Status badge logic exists but needs PRD-standard labels and lock-mode connection
- Overview should continue to summarize totals, pending listings, and provider health

## 14. About / Services / Help PRD

## Route behavior
- `/about` and `/help` should remain available
- `/help` may render the same page with the Help tab preselected, or use anchors/state

## Required content structure
### About tab
- Mission
- Trust/safety
- Centralized access to verified off-campus bedspaces
- Student-first value proposition

### How it works tab
- Search
- Filter
- Explore listings
- Contact provider
- Secure bedspace

### Services tab
Two clear groups:
- For Students
- For Providers

### Help tab
- FAQ accordion
- Contact/help cards
- Escalation/support channels

## Contact cards
Help/contact area should use polished cards for:
- WhatsApp
- Phone
- Email
- Optional office hours/support response note

## Gap notes from current implementation
- Existing page is structurally close
- Needs standardized wording and stronger implementation detail for `/help` behavior
- Contact section is currently a plain card/list instead of polished contact cards

## 15. Footer PRD

## Structural rules
- **3-column desktop layout**
- **Stacked mobile layout**
- Must remain clean and not overcrowded

## Recommended columns
1. Brand / mission
2. Explore / platform links
3. Contact / provider CTA

Alternative 4th micro-section is acceptable only if styling stays balanced, but target spec should remain 3-column.

## Required footer content
- UniBoard summary
- Key links:
  - Home
  - Browse bedspaces
  - About
  - Help
  - Register / Create listing
- Contact info
- Copyright
- Privacy / Terms placeholders only if non-broken

## Gap notes from current implementation
- Footer currently trends toward 4 columns
- Social icons depend on Bootstrap Icons but package inclusion is not documented here
- Final implementation should avoid broken icon dependencies if not globally available
- Copy needs bedspace/off-campus wording cleanup

## 16. Data + API Expectations for Frontend

Frontend should remain implementation-oriented around existing APIs and likely additions, without inventing new libraries.

## Existing relevant endpoints from project analysis
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties`
- `PUT /api/properties/:id`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/properties`

## Frontend assumptions to preserve
- Auth store remains source of current user/session state
- `PropertyCard` and dashboards should tolerate partial backend data
- Admin moderation may currently be driven by:
  - role
  - is_verified / isVerified
  - is_banned
  - approved
- Parent integration should normalize these shapes, not require brand new libraries

## Additional data expectations needed for final UX
These are product expectations, not guaranteed implemented endpoints:
- Dynamic campus popularity data from DB
- Listing/provider status fields sufficient for:
  - Active
  - Pending
  - Disabled/Locked
- Availability fields sufficient for:
  - high / medium / low availability UI mapping
- Search/filter endpoint support for query params

## React Query expectations
Use React Query for:
- listings collection
- listing detail
- campus popularity / popular locations
- landlord dashboard collections
- admin dashboard collections
- auth-adjacent “me” revalidation where already compatible

## 17. Componentization Requirements

Reusable components should be favored for:
- section headers
- stat cards
- empty states
- filter bars
- availability badges
- status badges
- contact cards
- promo/CTA sections
- listing cards
- dashboard table badges/controls

Do not duplicate ad hoc styles across pages.

## 18. Accessibility and UX Requirements

- Proper button semantics for filter toggles and tab switches
- Clear form labels
- Visible focus states
- Sufficient contrast in dark mode
- Offcanvas dismissibility and keyboard accessibility
- Loading, empty, and error states for all data-backed screens
- Avoid dead links to undefined routes
- Responsive tap targets on mobile

## 19. Implementation Priorities

### Priority 1
- Standardize copy: bedspace/off-campus/provider wording
- Formalize design system and theme behavior
- Fix navbar/offcanvas/auth contract
- Replace imperative list fetching with React Query on Home/browse

### Priority 2
- URL query param syncing for browse filters
- Dynamic campus popularity from DB
- Listing card availability/status normalization
- Footer and About/Help content refinement

### Priority 3
- Provider dashboard polish with limit state, lock mode, and better listing management affordances
- Admin dashboard provider status and lock-mode moderation clarity

## 20. Acceptance Criteria

The frontend is considered aligned when:

1. **Tech constraints**
   - Bootstrap 5 only
   - No Tailwind classes used in implementation
   - No new libraries added
   - React Query used for server-state-heavy pages

2. **Language consistency**
   - “bedspace” used consistently
   - “off-campus” spelling correct
   - “Shared Bedspace” used where relevant

3. **Browse experience**
   - Filters update URL query params
   - Browse results refetch live
   - Dynamic popular campus/area data comes from DB, not hardcoded arrays
   - Cards and empty states use bedspace terminology

4. **Auth/navigation**
   - Navbar uses modal-first auth
   - `/login` and `/register` remain route fallbacks
   - Mobile offcanvas behavior is polished and consistent

5. **Provider/admin workflows**
   - Provider dashboard clearly enforces 3-listing cap
   - Admin dashboard clearly shows Active / Pending / Disabled provider states
   - Disabled state maps to lock mode behavior in provider UX

6. **Content structure**
   - About page contains About / How it Works / Services / Help
   - Footer follows clean 3-column desktop, stacked mobile structure
   - Contact cards/support information are polished and reusable

## 21. UX Inspiration Direction

The final UI should feel like a blend of:
- modern student marketplace clarity
- trust-first accommodation platform
- lightweight SaaS dashboard polish

Reference direction:
- clean Bootstrap spacing and hierarchy
- soft surfaces, sharp readability
- minimal but expressive badges and status chips
- calm, premium, credible visual tone rather than flashy styling

## 22. Concise Gap Checklist for Parent Implementation

- Convert Home listings + campus popularity to React Query
- Sync browse filters to URL query params
- Standardize wording to bedspace/off-campus/provider across pages
- Replace room/property labels in cards, CTAs, and dashboard copy
- Normalize availability badges to high/medium/low UI
- Refine navbar labels and remove/guard broken links like `/profile` unless route exists
- Preserve modal-first auth with route fallback
- Clarify student/provider signup outcomes and pending provider state
- Upgrade landlord dashboard limit/lock UX
- Reframe admin users area into provider moderation with Active/Pending/Disabled logic
- Ensure footer and about/help structures match final polished spec
- Keep all implementation Bootstrap 5 only with reusable components and global theme support