const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "REJECTED"],
    default: "PENDING"
  },
  paymentProofUrl: {
    type: String, // Image URL from Cloudinary
    required: false
  },
  paymentProofType: {
    type: String,
    enum: ["screenshot", "transaction_id", "receipt"],
    required: false
  },
  paymentNotes: {
    type: String,
    required: false
  },
  rejectionReason: {
    type: String,
    required: false // reason why landlord rejected the booking
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date,
    required: false
  },
  rejectedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);