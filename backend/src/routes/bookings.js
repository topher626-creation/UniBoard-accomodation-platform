const express = require("express");
const { Booking, Property, PropertyImage, User } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/request", auth, async (req, res) => {
  try {
    if (req.user.role !== "student" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only students can request bookings" });
    }

    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    const property = await Property.findByPk(propertyId);
    if (!property || !property.approved) {
      return res.status(404).json({ message: "Property not available" });
    }

    const existing = await Booking.findOne({
      where: {
        user_id: req.user.id,
        property_id: propertyId,
        status: "PENDING"
      }
    });

    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this property" });
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      property_id: propertyId,
      status: "PENDING"
    });

    return res.status(201).json({ message: "Booking request created", bookingId: booking.id });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create booking request" });
  }
});

router.get("/user/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Property,
          as: "property",
          include: [
            { model: PropertyImage, as: "images", limit: 1 },
            { model: User, as: "landlord", attributes: ["name", "phone"] }
          ]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const formatted = bookings.map((booking) => ({
      _id: String(booking.id),
      id: booking.id,
      status: booking.status,
      paymentProofUrl: booking.payment_proof_url,
      paymentNotes: booking.payment_notes,
      rejectionReason: booking.rejection_reason,
      createdAt: booking.created_at,
      listing: booking.property
        ? {
            id: booking.property.id,
            title: booking.property.name,
            price: booking.property.price,
            images: booking.property.images?.map((image) => image.image_url) || [],
            location: { general: booking.property.location, exact: booking.property.location },
            landlordPhoneNumber: booking.property.landlord?.phone || booking.property.phone,
            paymentInstructions: "Contact landlord to confirm payment instructions."
          }
        : null
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({ message: "Only pending bookings can be cancelled" });
    }

    await booking.update({ status: "CANCELLED" });
    return res.json({ success: true, message: "Booking request cancelled" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cancel booking" });
  }
});

module.exports = router;