const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  locationArea: {
    type: String,
    enum: ["Garneton", "Zambia Compound", "Halawa", "Pathfinder", "Big Brothers"],
    required: true
  },
  location: {
    general: {
      type: String,
      required: true // e.g., "Near University of Zambia"
    },
    exact: {
      type: String,
      required: true // e.g., "123 Main Street, Lusaka"
    }
  },
  images: [{
    type: String, // Cloudinary URLs
    required: true
  }],
  availability: {
    type: Boolean,
    default: true
  },
  roomType: {
    type: String,
    enum: ["single", "shared", "apartment", "house"],
    default: "single"
  },
  amenities: [{
    type: String // e.g., ["WiFi", "Kitchen", "Laundry"]
  }],
  landlordPhoneNumber: {
    type: String,
    required: true // e.g., "+260955123456"
  },
  paymentInstructions: {
    type: String, // e.g., "MTN: 0955123456" or "Bank: Account #12345"
    required: true
  },
  visibility: {
    type: String,
    enum: ["public", "authenticated", "private"],
    default: "authenticated"
  },
  contactInfo: {
    phone: String,
    email: String
  }
}, {
  timestamps: true
});

// Index for search
listingSchema.index({ title: "text", description: "text", "location.general": "text" });

module.exports = mongoose.model("Listing", listingSchema);