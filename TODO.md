next# UniBoard Full Functionality TODO
Current Progress: [3/25] Completed

## Phase 1: Core Registration Flow (Priority 1) ✓
- [x] 1. Create multi-step Register.jsx (Sections 1-3 per specs)
- [x] 2. Add react-dropzone dep + NRC upload to cloudinary for landlords
- [x] 3. Update api.register to handle verification_url (doc_url storage, verification_url gen/return, guest upload fix)

## Phase 2: Backend Security & Guest Limits (Priority 2) 
- [x] 4. Edit backend/src/routes/properties.js - limit guest property detail (1img, truncated desc, no beds/features/phone/whatsapp/email/contact; auth full)
- [ ] 5. Add verification_docs model/table if needed

## Phase 3: Landlord Dashboard (Priority 3)
- [x] 6. Read/edit frontend/src/pages/LandlordDashboard.jsx - business_name top
- [ ] 7. Add team mgmt (add/remove max3 sub-landlords)
- [ ] 8. Add compound/business create form
- [ ] 9. Add building form (name/location/etc)
- [ ] 10. Add property form (full specs: checkboxes/images/beds auto-calc)

## Phase 4: Admin & UI Polish (Priority 4)
- [ ] 11. Enhance AdminDashboard.jsx - search/pending landlords/quick approve
- [ ] 12. Edit Navbar.jsx - TikTok social
- [ ] 13. Edit Footer.jsx - Help center WhatsApp/call #s
- [ ] 14. Edit PropertyDetail.jsx - WhatsApp wa.me, guest/logged views
- [ ] 15. global.css - spacing/shadows/loading/empty/responsive

## Phase 5: DB & Testing (Priority 5)
- [ ] 16. Update schema.sql - verification_docs
- [ ] 17. Set MySQL env, migrate
- [ ] 18. Backend deps: multer/cloudinary if missing
- [ ] 19. Frontend deps: react-dropzone
- [ ] 20. Test full flows (register→approve→create→search→contact)

## Phase 6: Extras
- [ ] 21. Google signup stub/API
- [ ] 22. Bed tracking live update test
- [ ] 23. Mobile responsive audit
- [ ] 24. Error/loading states
- [ ] 25. Completion

**Next Step:** Implement Register.jsx redesign.

