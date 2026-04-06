const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");

const router = express.Router();

// Get reviews for a listing
router.get("/listing/:listingId", async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a review (authenticated users only)
router.post("/", auth, async (req, res) => {
  try {
    const { listingId, rating, comment } = req.body;

    // Check if user already reviewed this listing
    const existingReview = await Review.findOne({
      user: req.user._id,
      listing: listingId
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this listing" });
    }

    const review = new Review({
      user: req.user._id,
      listing: listingId,
      rating,
      comment
    });

    await review.save();
    await review.populate("user", "name");

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review (review owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;

    await review.save();
    await review.populate("user", "name");

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (review owner or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;