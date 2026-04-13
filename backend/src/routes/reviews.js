const express = require("express");
const { Review, User, Listing } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get reviews for a listing
router.get("/listing/:listingId", async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { listing_id: req.params.listingId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

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
      where: {
        user_id: req.user.id,
        listing_id: listingId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this listing" });
    }

    const review = await Review.create({
      user_id: req.user.id,
      listing_id: listingId,
      rating,
      comment
    });

    // Fetch the created review with user data
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a review (review owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;

    await review.save();

    // Fetch updated review with user data
    const updatedReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a review (review owner or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.destroy();
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;