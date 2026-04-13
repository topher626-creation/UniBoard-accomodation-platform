# UniBoard Phase 3: Landlord Dashboard TODO Breakdown
Current Progress: 0/5

## Overview
Phase 3 focuses on making LandlordDashboard functional with business_name display, team mgmt (max 3 sub-landlords), compound/business create, building create, property create form.

**Step 0:** Read current files
- frontend/src/pages/LandlordDashboard.jsx (current state)
- backend/src/routes/compounds.js, buildings.js (create endpoints?)
- Check models Compound.js, Building.js

## Step 1: Display business_name top ✓
- LandlordDashboard.jsx: Header now shows business_name || name

## Step 2: Team management (add/remove max3 sub-landlords)
- Backend: Add sub_landlords: ARRAY(User.id) to User model? Or junction table.
- Frontend: Table with add user email (invite?), remove buttons (max 3)

## Step 3: Compound/business create form
- Frontend form: name, location, description
- Backend POST /compounds (owner req.user.id)

## Step 4: Building create form
- Dropdown compounds (own), name, floors, etc.

## Step 5: Property create form (enhanced)
- Link existing CreateProperty.jsx or integrate tabs

**Next:** Read LandlordDashboard.jsx → Step 1

