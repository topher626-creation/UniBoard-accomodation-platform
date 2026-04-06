const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500
  },
  verified: {
    type: Boolean,
    default: false // Could be set to true if user actually rented the property
  }
}, {
  timestamps: true
});

// Ensure one review per user per listing
reviewSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);