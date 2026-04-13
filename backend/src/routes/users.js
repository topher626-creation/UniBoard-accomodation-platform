const express = require("express");
const bcrypt = require("bcrypt");
const { User, Property, Booking, Review, PropertyImage, Building, Compound } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate input
    if (name && name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    await user.update({
      name: name ? name.trim() : user.name,
      phone: phone !== undefined ? phone : user.phone
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Change password
router.put("/password", auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findByPk(req.user.id);

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await user.update({ password: hashedPassword });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's properties (for landlords)
router.get("/my-properties", auth, async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only landlords can view their properties" });
    }

    const whereClause = req.user.role === 'admin' ? {} : { landlord_id: req.user.id };

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        { model: PropertyImage, as: 'images' },
        { model: Building, as: 'building', include: [{ model: Compound, as: 'compound' }] }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedProperties = properties.map(prop => ({
      id: prop.id,
      name: prop.name,
      location: prop.location,
      price: prop.price,
      room_type: prop.room_type,
      total_beds: prop.total_beds,
      occupied_beds: prop.occupied_beds,
      available_beds: prop.total_beds - prop.occupied_beds,
      approved: prop.approved,
      images: prop.images.map(img => img.image_url),
      building: prop.building?.name,
      compound: prop.building?.compound?.name,
      created_at: prop.created_at
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get public user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'role', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user's properties count
    const propertiesCount = await Property.count({
      where: { landlord_id: user.id, approved: true }
    });

    // Get user's reviews received (for landlords)
    let reviewsReceived = [];
    if (user.role === 'landlord') {
      const properties = await Property.findAll({
        where: { landlord_id: user.id },
        attributes: ['id']
      });
      const propertyIds = properties.map(p => p.id);

      reviewsReceived = await Review.findAll({
        where: { listing_id: propertyIds },
        include: [{ model: User, as: 'user', attributes: ['name'] }]
      });
    }

    res.json({
      ...user.toJSON(),
      properties_count: propertiesCount,
      reviews_count: reviewsReceived.length,
      average_rating: reviewsReceived.length > 0
        ? (reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsReceived.length).toFixed(1)
        : null
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
