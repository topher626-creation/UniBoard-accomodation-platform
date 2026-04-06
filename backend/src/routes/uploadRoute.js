const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../config/multer");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "uniboard" },
      (error, result) => {
        if (error) return res.status(500).json(error);
        res.json(result);
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;