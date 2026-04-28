const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const auth = require("../middleware/auth");

router.post("/", (req, res, next) => {
  // Optional auth for register purpose
  if (req.query.purpose === 'register') {
    return upload.single("file")(req, res, next);
  }
  return auth(upload.single("image"))(req, res, next);
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Upload file is required" });
    }

    const purpose = req.query.purpose || 'general';
    const isPdf = req.file.mimetype === "application/pdf";
    const folder = purpose === 'register' ? "uniboard-documents" : (isPdf ? "uniboard-documents" : "uniboard");
    const resourceType = isPdf ? "raw" : "image";
    const maxFiles = purpose === 'register' ? 1 : 8;

    if (purpose === 'register' && req.files?.length > maxFiles) {
      return res.status(400).json({ message: `Maximum ${maxFiles} file for registration` });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType
        },
        (error, uploaded) => {
          if (error) return reject(error);
          return resolve(uploaded);
        }
      );

      stream.end(req.file.buffer);
    });

    return res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    return res.status(500).json({ message: "File upload failed", error: err.message });
  }
});


router.post("/upload-nrc", upload.single("nrc"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uniboard/nrc" },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    res.json({
      success: true,
      url: result.secure_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

module.exports = router;

