const express = require("express");
const { Booking, User, Property, PropertyImage, Building, Compound } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's bookings
router.get("/my-bookings", auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const whereClause = { user_id: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            {
              model: PropertyImage,
              as: 'images',
              limit: 1
            },
            {
              model: Building,
              as: 'building',
              include: [{ model: Compound, as: 'compound' }]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      status: booking.status,
      move_in_date: booking.move_in_date,
      duration_months: booking.duration_months,
      total_amount: booking.total_amount,
      payment_proof_url: booking.payment_proof_url,
      rejection_reason: booking.rejection_reason,
      notes: booking.notes,
      created_at: booking.created_at,
      property: booking.property ? {
        id: booking.property.id,
        name: booking.property.name,
        location: booking.property.location,
        price: booking.property.price,
        room_type: booking.property.room_type,
        image: booking.property.images && booking.property.images.length > 0 
          ? booking.property.images[0].image_url : null,
        compound: booking.property.building?.compound?.name,
        building: booking.property.building?.name
      } : null
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get booking by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            { model: PropertyImage, as: 'images' },
            { model: PropertyFeature, as: 'features' },
            { model: Building, as: 'building', include: [{ model: Compound, as: 'compound' }] },
            { model: User, as: 'landlord', attributes: ['name', 'phone', 'email'] }
          ]
        },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check authorization
    if (booking.user_id !== req.user.id && req.user.role !== 'admin' && booking.property?.landlord_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create booking request
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can create bookings" });
    }

    const { property_id, move_in_date, duration_months, notes } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Check property exists
    const property = await Property.findByPk(property_id, {
      include: [
        { model: Building, as: 'building', include: [{ model: Compound, as: 'compound' }] }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.approved) {
      return res.status(400).json({ message: "This property is not available for booking" });
    }

    // Check availability
    const availableBeds = property.total_beds - property.occupied_beds;
    if (availableBeds <= 0) {
      return res.status(400).json({ message: "No beds available for this property" });
    }

    // Check for existing pending booking
    const existingBooking = await Booking.findOne({
      where: {
        user_id: req.user.id,
        property_id,
        status: 'pending'
      }
    });

    if (existingBooking) {
      return res.status(400).json({ message: "You already have a pending booking for this property" });
    }

    // Calculate total amount
    const duration = duration_months || 1;
    const total_amount = Number(property.price) * duration;

    const booking = await Booking.create({
      user_id: req.user.id,
      property_id,
      move_in_date,
      duration_months: duration,
      total_amount,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      message: "Booking request created successfully",
      booking: {
        id: booking.id,
        status: booking.status,
        total_amount: booking.total_amount
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload payment proof
router.post("/:id/upload-proof", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: "Cannot upload proof for this booking status" });
    }

    const { payment_proof_url, payment_proof_type } = req.body;

    if (!payment_proof_url) {
      return res.status(400).json({ message: "Payment proof URL is required" });
    }

    await booking.update({
      payment_proof_url,
      payment_proof_type: payment_proof_type || 'image'
    });

    res.json({
      message: "Payment proof uploaded successfully",
      booking: {
        id: booking.id,
        payment_proof_url: booking.payment_proof_url
      }
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({ message: error.message });
  }
});

// Landlord confirms booking
router.patch("/:id/confirm", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only landlord or admin can confirm
    if (req.user.role !== 'admin' && booking.property?.landlord_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to confirm this booking" });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Booking is not in pending status" });
    }

    // Check property availability
    const availableBeds = booking.property.total_beds - booking.property.occupied_beds;
    if (availableBeds <= 0) {
      await booking.update({ status: 'rejected', rejection_reason: 'No beds available' });
      return res.status(400).json({ message: "No beds available for this property" });
    }

    await booking.update({ status: 'confirmed' });

    // Increment occupied beds
    await booking.property.update({
      occupied_beds: booking.property.occupied_beds + 1
    });

    res.json({
      message: "Booking confirmed successfully",
      booking: {
        id: booking.id,
        status: 'confirmed'
      }
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Landlord rejects booking
router.patch("/:id/reject", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Property, as: 'property' }]
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (req.user.role !== 'admin' && booking.property?.landlord_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to reject this booking" });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Booking is not in pending status" });
    }

    const { rejection_reason } = req.body;

    await booking.update({
      status: 'rejected',
      rejection_reason: rejection_reason || 'Booking rejected by landlord'
    });

    res.json({
      message: "Booking rejected",
      booking: {
        id: booking.id,
        status: 'rejected',
        rejection_reason: booking.rejection_reason
      }
    });
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel booking (user)
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    // If was confirmed, decrement occupied beds
    if (booking.status === 'confirmed') {
      const property = await Property.findByPk(booking.property_id);
      if (property && property.occupied_beds > 0) {
        await property.update({ occupied_beds: property.occupied_beds - 1 });
      }
    }

    await booking.update({ status: 'cancelled' });

    res.json({
      message: "Booking cancelled successfully",
      booking: {
        id: booking.id,
        status: 'cancelled'
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get landlord's bookings (bookings for their properties)
router.get("/landlord/bookings", auth, async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.query;

    const whereClause = req.user.role === 'admin' ? {} : { '$property.landlord_id$': req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Property,
          as: 'property',
          include: [
            { model: PropertyImage, as: 'images', limit: 1 }
          ]
        },
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching landlord bookings:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
