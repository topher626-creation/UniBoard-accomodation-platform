# TODO: Cloudinary NRC Upload Integration

## Approved Plan
Generic document upload for registration (students/landlords). Users upload any file, admin verifies if it's NRC/ID. 

- Backend: Add /api/upload-nrc endpoint (field \"nrc\", folder \"uniboard/nrc\")
- Frontend: Update Register.jsx to use task's handleFileChange logic with simple file input, set nrcUrl, send in register.
- DB: Add nrc_url field to User.
