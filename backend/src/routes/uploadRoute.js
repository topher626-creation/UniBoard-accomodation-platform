const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");
const auth = require("../middleware/auth");

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "uniboard", resource_type: "image" },
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
    return res.status(500).json({ message: "Image upload failed" });
  }
});

module.exports = router;