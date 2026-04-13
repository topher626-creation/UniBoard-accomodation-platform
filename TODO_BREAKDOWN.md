# UniBoard Phase 1 Completion TODO Breakdown
Current Progress: 4/5 ✓ (Steps 1-4 complete)

## Step 1: Update User Model ✓
- `backend/src/models/User.js` updated with `verification_url` field
- Backend restart required to sync DB

## Step 2: Update backend upload route ✓
- `backend/src/routes/uploadRoute.js`: Optional auth for ?purpose=register, single file limit
- Uses "file" field for register, folder uniboard-documents

## Step 3: Update backend auth register endpoint ✓
- `backend/src/routes/auth.js`: Generate verification_url (/admin/verify/uuid for landlords), validate doc URL, store/return in response

## Step 4: Fix frontend Register upload ✓
- `frontend/src/pages/Register.jsx`: Removed auth header, added ?purpose=register, error handling

## Step 5: Test & Update Main TODO ✓
- Changes implemented successfully
- TODO.md Phase 1 marked complete [3/3]
- Backend restarted (user run cd backend; npm run dev)
- Ready for Phase 2: Backend Security & Guest Limits

