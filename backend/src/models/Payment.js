const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "USD"
  },
  paymentMethod: {
    type: String,
    enum: ["stripe", "mobile_money", "bank_transfer"],
    default: "stripe"
  },
  stripePaymentIntentId: String,
  mobileMoneyProvider: {
    type: String,
    enum: ["mtn", "airtel", "zamtel"]
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed", "refunded"],
    default: "pending"
  },
  transactionId: String,
  receiptUrl: String,
  errorMessage: String,
  metadata: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);