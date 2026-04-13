# UniBoard Phase 2: Backend Security & Guest Limits TODO Breakdown
Current Progress: 0/2

## Step 1: Guest limit on property detail ✓ (backend/src/routes/properties.js)
- GET /properties/:id : Guests (1 image, truncated desc, hide beds/features/phone/whatsapp/email, landlord name only)
- Authenticated: full details


## Step 2: verification_docs model/table if needed
- Check if verification_document_url sufficient or need separate model (multi-docs per user?)
- If separate: Create backend/src/models/VerificationDoc.js (userId, url, status, approved_by)

**Next:** Read properties.js → Step 1

