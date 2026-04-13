# Dashboard and Card Audit Summary

## Files reviewed
- `frontend/src/components/cards/PropertyCard.jsx`
- `frontend/src/pages/LandlordDashboard.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/pages/PropertyDetail.jsx`
- `frontend/src/services/api.js`
- `frontend/src/stores/authStore.ts`

## Overall assessment
The current implementation is functional, but it does not yet meet the requested polished frontend spec in a few important areas:

- wording is still mixed between **property / room / beds** instead of consistently centering **bedspace**
- availability states are not aligned to the requested **low / medium / high** model
- landlord listing management enforces a numeric cap in one place, but the UX is still basic and not clearly tied to approval/lock assumptions
- admin user management is too generic; it needs a dedicated landlord-management interpretation with **Active / Pending / Disabled** states and a clear **lock mode**
- some route and API assumptions are already baked into the current code and should be preserved unless backend contracts are intentionally updated

Below is an exact file-by-file recommendation set the parent agent can implement.

---

## 1) `frontend/src/components/cards/PropertyCard.jsx`

## What exists now
- Links to `/property/${property.id}`
- Uses `property.availability_status`
- Current availability labels:
  - `AVAILABLE` → `Available`
  - `LOW` → `Limited`
  - fallback → `Full`
- Uses `property.room_type`
- Room type labels:
  - `single` → `Single`
  - `bedsitter` → `Bedsitter`
  - `self-contained` → `Self-contained`
- Shows:
  - image
  - name
  - location / compound
  - price
  - `available_beds`
  - `occupied_beds/total_beds`
  - optional landlord name

## Gaps against requested spec
1. **Wording inconsistency**
   - Uses `room_type`
   - Shows `beds`
   - Does not present the UI explicitly as a bedspace card
   - Should avoid room-centric user-facing labels even if backend field remains `room_type`

2. **Availability badge model mismatch**
   - Requested model is **low / medium / high**
   - Current logic uses `AVAILABLE / LOW / else`
   - Labels are not aligned to user-facing inventory clarity

3. **User-facing taxonomy not standardized**
   - Spec requires wording standardization to **bedspace**
   - If there is any legacy “2 bunker” option in data, it must display as **Shared Bedspace**
   - Current labels do not account for that

## Exact recommendations
### A. Preserve route contract
Keep:
- `to={`/property/${property.id}`}`

Do **not** change route shape unless the parent agent updates app routing globally.

### B. Keep backend fields, change only presentation layer
Preserve existing data assumptions:
- `property.room_type`
- `property.availability_status`
- `property.available_beds`
- `property.occupied_beds`
- `property.total_beds`

But remap them in UI copy.

### C. Replace room labels with bedspace labels
Recommended display mapping:
- `single` → `Single Bedspace`
- `bedsitter` → `Bedsitter`
- `self-contained` → `Self-contained`
- `"2 bunker"` or `shared` or `double` if encountered → `Shared Bedspace`

Important:
- backend field can remain `room_type`
- only the visible label should change

### D. Introduce normalized availability display helper
Current backend appears to send symbolic states, but the spec wants low/medium/high semantics.

Recommended UI normalization:
- `HIGH` or `AVAILABLE` or a high stock ratio → badge text `High Availability`
- `MEDIUM` or moderate stock ratio → badge text `Medium Availability`
- `LOW` → badge text `Low Availability`
- zero stock → `Full`

If backend does **not** provide `MEDIUM` today, parent should derive it from counts:
- `available_beds <= 0` → `Full`
- `available_beds === 1` or very small ratio → `Low Availability`
- `available_beds < total_beds` and not low → `Medium Availability`
- `available_beds === total_beds` or clearly high stock → `High Availability`

This avoids requiring immediate backend changes.

### E. Rename card copy
Recommended visible copy updates:
- `{property.available_beds} beds` → `{property.available_beds} bedspaces`
- `({property.occupied_beds}/{property.total_beds} occupied)` → `({property.occupied_beds}/{property.total_beds} occupied bedspaces)` or shorter `Occupied: X/Y`
- if parent wants cleaner UI: show `X bedspaces left`

### F. Avoid duplicate location noise
Current card may show location and compound separately in a repetitive way:
- line 1: location or compound
- line 2: compound again

Recommendation:
- primary line: `📍 location`
- secondary line only if compound exists and differs from location
- use concise, non-redundant metadata

---

## 2) `frontend/src/pages/LandlordDashboard.jsx`

## What exists now
- Access guard allows `landlord` and `admin`
- Redirects unauthorized users to `/login`
- Fetches:
  - `api.getMyProperties()`
  - `api.getLandlordBookings()`
- Hard limit:
  - `MAX_LISTINGS = 3`
- Has warning alert when limit reached
- Shows:
  - stats
  - tabbed properties/bookings
  - add new card only when below limit
  - delete via dropdown
- Uses `create-listing` route
- User-facing labels still say:
  - `properties`
  - `beds`
  - `No Properties Yet`
  - `Add New Property`

## Gaps against requested spec
1. **3-listing limit exists, but UX is not polished enough**
   - The limit is technically enforced in UI, but not visualized as a managed quota
   - Add/delete affordances are basic
   - There is no “remaining slots” framing
   - There is no disabled add state when max is reached

2. **Wording inconsistency**
   - Still says Property/Properties throughout
   - Some of that can stay in route/data naming, but user-facing copy should move toward listings/bedspaces
   - `beds available` should become `bedspaces available`

3. **Approval/lock awareness is incomplete**
   - Card shows only `Approved` or `Pending`
   - No disabled/locked state for a landlord listing if admin lock mode exists
   - No explicit relationship to account status

4. **Delete affordance is hidden**
   - Delete is only inside dropdown
   - The spec asks for clear add/delete affordances

## Exact recommendations
### A. Preserve route and API assumptions
Keep unless backend changes are coordinated:
- route: `/create-listing`
- route: `/property/:id`
- `api.getMyProperties()`
- `api.getLandlordBookings()`
- `api.deleteProperty(id)`
- `api.confirmBooking(id)`
- `api.rejectBooking(id, reason)`

These are already used consistently and should remain stable.

### B. Keep `MAX_LISTINGS = 3`, but turn it into explicit quota UI
Recommended additions:
- a header stat like `Listings Used: 2/3`
- helper text:
  - `You can publish up to 3 listings`
  - `1 slot remaining`
- a progress bar or segmented indicator
- when at limit:
  - show disabled add card/button
  - label: `Listing limit reached`
  - helper: `Delete an existing listing to add a new one`

### C. Make add/delete affordances more explicit
Recommended UI changes:
- Keep top CTA:
  - `+ Add Listing` when below limit
  - disabled `Limit Reached` button when at 3
- On each listing card:
  - visible action row with `View`, `Edit` (if route exists later), `Delete`
  - if edit route does not exist, do not invent it yet; keep `View` + `Delete`
- Keep dropdown only as optional secondary menu, not the only delete path

### D. Standardize visible wording
Recommended copy changes:
- `Landlord Dashboard` can remain unless product branding wants `Provider Dashboard`
- `My Properties` → `My Listings`
- `No Properties Yet` → `No Listings Yet`
- `Add New Property` → `Add New Listing`
- `beds available` → `bedspaces available`
- booking dialog and listing metadata should use `bedspace`

### E. Expand listing status states
Current listing card only has:
- Approved
- Pending

Recommended listing/admin-facing statuses:
- `Approved` / `Active`
- `Pending Review`
- `Disabled` or `Locked`

If backend only exposes `approved`, parent can still derive:
- `approved === true` → `Active`
- `approved === false` → `Pending Review`

But if lock mode will also affect listings, a disabled state should be displayable when a listing or owner is blocked.

### F. Booking table wording
Recommended user-facing copy:
- `Property` column may remain if tied to listing object name, but preferable label is `Listing`
- `Request Booking` terminology in other pages should align with landlord receiving bedspace booking requests

### G. Access behavior assumption
Current guard allows admins into landlord dashboard:
- `user.role !== "landlord" && user.role !== "admin"`

This should probably be preserved because admin header links already cross-link to landlord panel. If parent wants stricter role separation, that must be coordinated with routing.

---

## 3) `frontend/src/pages/AdminDashboard.jsx`

## What exists now
- Admin-only guard, redirects non-admins to `/`
- Fetches:
  - `api.getAdminStats()`
  - `api.getAdminUsers()`
  - `api.getAdminProperties()`
- User management is generic for all users
- Status badge logic:
  - `is_banned` → `Disabled`
  - `role === "pending"` or `!is_verified` → `Pending`
  - else → `Active`
- Actions:
  - update role
  - ban/unban
  - delete user
- Property moderation:
  - approve pending property
  - delete property

## Gaps against requested spec
1. **No dedicated landlord management table**
   - Current users tab mixes students, landlords, and admins
   - Requested spec specifically calls for an admin landlord table with
     - `Active`
     - `Pending`
     - `Disabled`
     - lock mode

2. **Lock mode is not explicit**
   - Current “ban/unban” is operationally similar, but the UI language does not reflect the requested lock mode concept
   - There is no visual “locked” state or reason context

3. **Status derivation is too broad**
   - `role === "pending"` is fragile
   - likely the actual pending landlord onboarding state should derive from approval / verification flags rather than overloading role

4. **Property wording still generic**
   - Overview talks about properties everywhere
   - For user-facing consistency, admin can still manage listings, while preserving API endpoint names

## Exact recommendations
### A. Preserve existing admin API contracts
Keep these assumptions unless backend team changes them:
- `api.getAdminStats()`
- `api.getAdminUsers()`
- `api.updateUserRole(id, role)`
- `api.banUser(id, banned)`
- `api.deleteUser(id)`
- `api.getAdminProperties()`
- `api.approveProperty(id, approved)`
- `api.deletePropertyAdmin(id)`

These are the current stable hooks.

### B. Split “Users” into role-aware admin views
Recommended tab structure:
- `Overview`
- `Landlords`
- `Listings`
- optionally `All Users` only if still needed

If minimizing changes, keep `Users` tab but default-filter it to landlords and rename it `Landlords`.

### C. Define landlord state mapping clearly
Recommended landlord status rules:
- `Disabled`
  - when `user.is_banned === true`
- `Pending`
  - when landlord/provider account exists but is not verified/approved
  - current fallback: `!user.is_verified`
- `Active`
  - landlord role and verified and not banned

Important:
- avoid using `role === "pending"` as the main model unless backend explicitly sends that
- pending should be a **status**, not a role, if possible

### D. Rename “ban/unban” to lock mode in UI
Requested spec mentions lock mode. Recommended admin UX:
- button labels:
  - `Lock Account` instead of `Ban`
  - `Unlock Account` instead of `Unban`
- status chip:
  - `Disabled`
- optional helper text:
  - `Locked by admin`

Backend can still use existing `api.banUser(id, banned)` with the same boolean payload. Only UI wording changes.

### E. Landlord table columns recommended
For the landlord management table:
- Landlord Name
- Email
- Phone (if available)
- Listings Count
- Status (`Active`, `Pending`, `Disabled`)
- Lock Mode / Access
- Actions

Recommended actions:
- `Activate` or `Approve` for pending landlords if backend supports it
- `Lock`
- `Unlock`
- `View Listings`
- `Delete` only as destructive fallback

### F. Property/listing moderation wording
Recommended copy changes:
- `Properties` tab → `Listings`
- `Pending Approval` → `Pending Review`
- `Approved` → `Active`
- `Delete Property` text can remain in code, but UI should say `Delete Listing`

### G. Stats wording
Recommended visible labels:
- `Total Properties` → `Total Listings`
- `Approved` → `Active Listings`
- `Average property price` → `Average listing price`

### H. Redirect behavior assumption
Current non-admin redirect goes to `/`
This is acceptable and should likely remain, unless the parent standardizes all protected routes to `/login`.

---

## 4) `frontend/src/pages/PropertyDetail.jsx`

## What exists now
- Fetches one property by `id`
- Redirects unauthenticated booking/favorite actions to `/login`
- Booking confirmation text already says `bedspace`
- Availability badge uses:
  - `AVAILABLE` → `Available`
  - `LOW` → `Limited Beds`
  - else → `Full`
- Type label uses:
  - `single` → `Single Room`
  - `bedsitter`
  - `self-contained`
- Details section already says `About this bedspace`
- Stats say `Total Beds`, `Available Beds`
- Sidebar says `Bedspace Type`, `Available Beds`, `Occupied`

## Gaps against requested spec
1. **Mixed wording still present**
   - `Single Room` should not remain
   - `Total Beds` and `Available Beds` should become bedspace-based labels

2. **Availability model mismatch**
   - Same issue as card component; no medium/high states

3. **Route/data assumptions are important here**
   - This page relies on a rich property object shape that should be preserved

## Exact recommendations
### A. Preserve route and fetch assumptions
Keep:
- route param `id`
- `api.getProperty(id)`
- `navigate("/login")` fallback for gated actions unless parent replaces with modal-trigger architecture
- `api.createBooking({ property_id: id })`
- `api.addFavorite(id)`

### B. Standardize bedspace-facing copy
Recommended visible labels:
- `Single Room` → `Single Bedspace`
- `Total Beds` → `Total Bedspaces`
- `Available Beds` → `Available Bedspaces`
- `No Beds Available` → `No Bedspaces Available`

### C. Normalize availability badge text
Recommended final badge labels:
- `High Availability`
- `Medium Availability`
- `Low Availability`
- `Full`

As in `PropertyCard`, derive from `availability_status` or counts if necessary.

### D. Preserve rich property object shape
This page currently assumes these fields may exist:
- `id`
- `name`
- `images`
- `location`
- `building`
- `compound`
- `availability_status`
- `room_type`
- `average_rating`
- `review_count`
- `description`
- `total_beds`
- `available_beds`
- `occupied_beds`
- `features`
- `reviews`
- `price`
- `landlord.name`
- `landlord.phone`
- `landlord.whatsapp`

These assumptions should be preserved because multiple UI sections depend on them.

### E. Auth flow assumption
Current behavior redirects to `/login` for unauthenticated save/booking actions.
Because project context mentions a hybrid auth modal + route fallback, parent should preserve this fallback even if modal-first behavior is added later.

---

## 5) `frontend/src/services/api.js`

## What exists now
This file is the main service contract. Relevant existing methods:
- property APIs:
  - `getProperties`
  - `getProperty`
  - `createProperty`
  - `updateProperty`
  - `deleteProperty`
  - `getMyProperties`
- booking APIs:
  - `getLandlordBookings`
  - `confirmBooking`
  - `rejectBooking`
- admin APIs:
  - `getAdminStats`
  - `getAdminUsers`
  - `updateUserRole`
  - `banUser`
  - `deleteUser`
  - `getAdminProperties`
  - `approveProperty`
  - `deletePropertyAdmin`

## What should be preserved
These routes are already used by the reviewed pages and should be treated as current contract:
- `/properties/:id`
- `/properties/mine`
- `/bookings/landlord/bookings`
- `/admin/stats`
- `/admin/users`
- `/admin/properties`

## Gaps against requested spec
1. No explicit endpoint names for landlord approval/disable workflow beyond generic user operations
2. No explicit lock mode endpoint; current `banUser` is the closest equivalent
3. No explicit endpoint returning normalized listing quota metadata for landlord dashboard

## Exact recommendations
### A. Do not break existing method names
Parent should preserve all currently consumed methods because the reviewed pages already depend on them.

### B. Preferred enhancements if backend supports them later
Optional additions, but only if implemented end-to-end:
- `getAdminLandlords()` for a landlord-only table
- `updateLandlordStatus(id, status)` for `active/pending/disabled`
- `lockUser(id)` / `unlockUser(id)` wrappers that internally call existing ban endpoint
- `getMyListingQuota()` if backend returns `used`, `max`, `remaining`

If backend does **not** support these, the frontend should keep using:
- `getAdminUsers()` + filter landlords client-side
- `banUser()` as lock/unlock transport
- `getMyProperties().length` for quota calculation

### C. Availability support assumption
There is no dedicated helper in the API layer for availability normalization, so parent should implement normalization in UI/components unless backend starts returning a ready-made enum like:
- `HIGH`
- `MEDIUM`
- `LOW`
- `FULL`

---

## 6) `frontend/src/stores/authStore.ts`

## What exists now
- Zustand store
- stores `user`, `isAuthenticated`, `isLoading`
- login/register/logout/hydrate/updateUser
- `user` is sourced from API/localStorage

## Relevance to requested spec
This store matters because:
- dashboards use `user.role`
- admin/landlord access decisions depend on current user shape
- lock mode and landlord status may need to surface in auth state

## Gaps against requested spec
1. No explicit typed status fields for landlord/admin approval flow
2. Dashboards currently assume only `role` is necessary for access
3. If account lock mode should affect navigation and dashboard access, auth state may need more explicit flags

## Exact recommendations
### A. Preserve current public store contract
Keep these members stable:
- `user`
- `isAuthenticated`
- `isLoading`
- `login`
- `register`
- `logout`
- `hydrate`
- `updateUser`

Other pages are likely depending on them.

### B. Expand user assumptions carefully, not destructively
Recommended user shape support in UI logic:
- `user.role`
- `user.is_banned`
- `user.is_verified`
- optional future fields:
  - `user.status`
  - `user.locked_at`
  - `user.account_state`

Do not require these new fields unless backend already provides them.

### C. Preserve role assumptions for route guards
Current role assumptions to preserve:
- landlord dashboard allows:
  - `landlord`
  - `admin`
- admin dashboard allows:
  - `admin`

If lock mode is added globally, route guards should also consider `user.is_banned` or equivalent, but that would be a coordinated auth change outside this audit scope.

---

## Cross-file implementation recommendations

## 1. Bedspace wording consistency
Apply to all visible UI copy in these reviewed areas:
- `room` → `bedspace`
- `beds` → `bedspaces`
- `Single Room` → `Single Bedspace`
- any legacy `2 bunker` term → `Shared Bedspace`
- `Property` in dashboard UI should usually become `Listing`
- keep backend object/field names unchanged unless backend migration is planned

## 2. Availability badges low/medium/high
Use a shared normalization rule across both:
- `PropertyCard`
- `PropertyDetail`

Recommended output labels:
- `High Availability`
- `Medium Availability`
- `Low Availability`
- `Full`

Recommended source priority:
1. explicit `property.availability_status` if backend sends rich enum
2. otherwise derive from:
   - `available_beds`
   - `total_beds`

This must be consistent across card and detail views.

## 3. Landlord 3-listing limit UI
Already partially present in `LandlordDashboard`.
Needed improvements:
- show usage counter `X/3`
- show remaining slots
- top CTA disables at max
- “add listing” card becomes disabled/locked visual at max
- delete action becomes visible and immediate enough to support replacing listings
- empty state and tabs should say `Listings`, not `Properties`

## 4. Admin landlord table states and lock mode
Current admin page has the raw ingredients but not the final UX.
Needed changes:
- landlord-focused table or filtered landlord tab
- status states:
  - `Active`
  - `Pending`
  - `Disabled`
- lock mode language:
  - `Lock`
  - `Unlock`
  - `Locked by admin` if helpful
- keep using current `banUser` transport unless backend offers better-named endpoints

## 5. Route/data assumptions that must be preserved
Preserve these route assumptions:
- `/property/:id`
- `/create-listing`
- `/login`
- `/landlord`
- `/admin`

Preserve these key data assumptions:
- property object uses fields like:
  - `id`
  - `name`
  - `price`
  - `location`
  - `compound`
  - `building`
  - `room_type`
  - `availability_status`
  - `available_beds`
  - `occupied_beds`
  - `total_beds`
  - `approved`
  - `landlord`
- user object uses:
  - `role`
  - possibly `is_banned`
  - possibly `is_verified`
- booking object uses:
  - `id`
  - `status`
  - `user`
  - `property`
  - `move_in_date`
  - `duration_months`

These are already relied on in the reviewed pages and should not be broken accidentally.

---

## Recommended priority order for parent implementation
1. Create a shared presentation mapping for:
   - bedspace labels
   - availability badge normalization
2. Update `PropertyCard.jsx`
3. Update `PropertyDetail.jsx`
4. Update `LandlordDashboard.jsx` for listings quota UX and wording
5. Update `AdminDashboard.jsx` for landlord states and lock mode wording
6. Only then consider optional API wrapper additions if needed for readability

---

## Key takeaway
The backend/service contracts are mostly usable as-is. The main work is **presentation normalization and dashboard UX restructuring**, not a full data-model rewrite. The safest path is:
- preserve current routes and API methods
- preserve current backend field names
- standardize user-facing wording to **bedspace**
- derive `low/medium/high` availability in the UI
- promote existing `ban/unban` behavior into clearer **lock mode** language
- turn the landlord dashboard’s existing 3-listing cap into an explicit, polished quota experience