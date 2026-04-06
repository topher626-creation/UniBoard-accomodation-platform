const express = require("express");
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// Request a booking (student initiates)
router.post("/request", auth, async (req, res) => {
  try {
    const { listingId } = req.body;

    // Validate listing exists and is available
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (!listing.availability) {
      return res.status(400).json({ message: "Property is no longer available" });
    }

    // Check if user already has a pending/confirmed booking for this listing
    const existingBooking = await Booking.findOne({
      user: req.user._id,
      listing: listingId,
      status: { $in: ["PENDING", "CONFIRMED"] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You already have an active booking request for this property" });
    }

    // Create booking request
    const booking = new Booking({
      user: req.user._id,
      listing: listingId,
      status: "PENDING"
    });

    await booking.save();
    await booking.populate("listing", "title price landlordPhoneNumber paymentInstructions");
    await booking.populate("user", "name email phone");

    res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload payment proof
router.post("/:bookingId/upload-proof", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentProofUrl, paymentProofType, paymentNotes } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization - only booking owner
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Can only upload proof for pending bookings" });
    }

    // Update booking with payment proof
    booking.paymentProofUrl = paymentProofUrl;
    booking.paymentProofType = paymentProofType;
    booking.paymentNotes = paymentNotes || "";

    await booking.save();
    await booking.populate("listing", "title price");
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Payment proof uploaded successfully. Waiting for landlord confirmation.",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Landlord confirms booking
router.post("/:bookingId/confirm", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization - only landlord who owns the property
    if (booking.listing.landlord.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to confirm this booking" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Can only confirm pending bookings" });
    }

    // Update booking status
    booking.status = "CONFIRMED";
    booking.confirmedAt = new Date();
    await booking.save();

    // Mark listing as unavailable
    booking.listing.availability = false;
    await booking.listing.save();

    await booking.populate("listing", "title price");
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Landlord rejects booking
router.post("/:bookingId/reject", auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rejectionReason } = req.body;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization - only landlord who owns the property
    if (booking.listing.landlord.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to reject this booking" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Can only reject pending bookings" });
    }

    // Update booking status
    booking.status = "REJECTED";
    booking.rejectionReason = rejectionReason || "No reason provided";
    booking.rejectedAt = new Date();
    await booking.save();

    await booking.populate("listing", "title price");
    await booking.populate("user", "name email phone");

    res.json({
      success: true,
      message: "Booking rejected",
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's bookings (student view)
router.get("/user/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing", "title price images location landlordPhoneNumber paymentInstructions")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get bookings for a property (landlord view)
router.get("/property/:propertyId", auth, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const listing = await Listing.findById(propertyId);
    if (!listing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check authorization - only landlord owner
    if (listing.landlord.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const bookings = await Booking.find({ listing: propertyId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single booking
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("listing", "title price images location landlordPhoneNumber paymentInstructions landlord")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization - booking owner, landlord, or admin
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isLandlord = booking.listing.landlord._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isLandlord && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (student only, before confirmation)
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Can only cancel pending bookings" });
    }

    // Delete booking
    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Booking request cancelled"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;