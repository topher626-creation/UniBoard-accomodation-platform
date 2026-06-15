const express = require("express");
const { User, Property, PropertyImage, PropertyFeature, Review } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Get all users with optional filtering
router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const { role, status } = req.query;
    let whereClause = {};

    if (role) {
      whereClause.role = role;
    }
    if (status) {
      whereClause.status = status;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]]
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending landlord approvals
router.get("/landlords/pending", auth, requireAdmin, async (req, res) => {
  try {
    const pendingLandlords = await User.findAll({
      where: {
        role: "landlord",
        status: "pending"
      },
      attributes: { exclude: ["password"] },
      order: [["created_at", "ASC"]]
    });

    res.json(pendingLandlords);
  } catch (error) {
    console.error("Error fetching pending landlords:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update user role and status
router.put("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { role, status } = req.body;

    if (!["student", "landlord", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = { role };
    if (status && ["pending", "active", "disabled"].includes(status)) {
      updates.status = status;
      updates.isVerified = status === "active";
    }

    await user.update(updates);

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
});

// Approve landlord account
router.patch("/users/:id/approve-landlord", auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "landlord") {
      return res.status(400).json({ message: "Only landlord accounts can be approved" });
    }

    await user.update({
      status: "active",
      isVerified: true,
      is_banned: false
    });

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    return res.json({
      message: "Landlord approved successfully",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve landlord" });
  }
});

// Reject landlord account
router.patch("/users/:id/reject-landlord", auth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "landlord") {
      return res.status(400).json({ message: "Only landlord accounts can be rejected" });
    }

    await user.update({
      status: "disabled",
      isVerified: false,
      rejection_reason: reason || null
    });

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    return res.json({
      message: "Landlord rejected successfully",
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to reject landlord" });
  }
});

// Ban/unban user
router.patch("/users/:id/ban", auth, requireAdmin, async (req, res) => {
  try {
    const { banned } = req.body;
    if (typeof banned !== "boolean") {
      return res.status(400).json({ message: "banned must be true or false" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban admin users" });
    }

    await user.update({ is_banned: banned });
    if (banned) {
      await user.update({ status: "disabled" });
    } else if (user.status === "disabled") {
      await user.update({
        status: user.role === "landlord" && !user.isVerified ? "pending" : "active"
      });
    }

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ban status" });
  }
});

// Delete user
router.delete("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await Property.destroy({ where: { landlord_id: req.params.id } });
    await user.destroy();

    res.json({ message: "User and their properties deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all properties (with optional filtering)
router.get("/properties", auth, requireAdmin, async (req, res) => {
  try {
    const { approved } = req.query;
    let whereClause = {};

    if (approved !== undefined) {
      whereClause.approved = approved === 'true';
    }

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "landlord",
          attributes: ["id", "name", "email", "business_name", "status"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get pending properties for approval
router.get("/properties/pending", auth, requireAdmin, async (req, res) => {
  try {
    const pendingProperties = await Property.findAll({
      where: { approved: false },
      include: [
        {
          model: PropertyImage,
          as: 'images'
        },
        {
          model: User,
          as: "landlord",
          attributes: ["id", "name", "email", "business_name", "nrc_front_url", "nrc_back_url"]
        }
      ],
      order: [["created_at", "ASC"]]
    });

    res.json(pendingProperties);
  } catch (error) {
    console.error("Error fetching pending properties:", error);
    res.status(500).json({ message: error.message });
  }
});

// Approve property
router.patch("/properties/:id/approve", auth, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "landlord",
          attributes: ["name", "email"]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await property.update({ approved: true });

    res.json({
      message: "Property approved successfully",
      property: property
    });
  } catch (error) {
    console.error("Error approving property:", error);
    res.status(500).json({ message: error.message });
  }
});

// Reject property
router.patch("/properties/:id/reject", auth, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "landlord",
          attributes: ["name", "email"]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await property.destroy();

    res.json({
      message: "Property rejected and deleted successfully",
      reason: reason || null
    });
  } catch (error) {
    console.error("Error rejecting property:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update occupancy (bedspace management)
router.patch("/properties/:id/occupancy", auth, requireAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    if (!["increment", "decrement"].includes(action)) {
      return res.status(400).json({ message: "action must be increment or decrement" });
    }

    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    let nextOccupied = property.occupied_bedspaces;
    if (action === "increment") {
      if (property.occupied_bedspaces >= property.total_bedspaces) {
        return res.status(400).json({ message: "Property is already full" });
      }
      nextOccupied += 1;
    } else {
      if (property.occupied_bedspaces <= 0) {
        return res.status(400).json({ message: "Occupied bedspaces cannot go below 0" });
      }
      nextOccupied -= 1;
    }

    await property.update({ occupied_bedspaces: nextOccupied });
    return res.json({
      message: "Occupancy updated successfully",
      property: {
        id: property.id,
        total_bedspaces: property.total_bedspaces,
        occupied_bedspaces: nextOccupied,
        available_bedspaces: property.total_bedspaces - nextOccupied
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update occupancy" });
  }
});

// Delete property
router.delete("/properties/:id", auth, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await PropertyFeature.destroy({ where: { property_id: property.id } });
    await PropertyImage.destroy({ where: { property_id: property.id } });
    await property.destroy();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get admin statistics
router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProperties = await Property.count();
    const approvedProperties = await Property.count({ where: { approved: true } });
    const pendingProperties = await Property.count({ where: { approved: false } });
    const pendingLandlords = await User.count({
      where: { role: "landlord", status: "pending" }
    });
    const activeLandlords = await User.count({
      where: { role: "landlord", status: "active" }
    });

    const usersByRole = await User.findAll({
      attributes: [
        "role",
        [User.sequelize.fn("COUNT", User.sequelize.col("role")), "count"]
      ],
      group: ["role"]
    });

    const averagePrice = await Property.findAll({
      attributes: [
        [Property.sequelize.fn("AVG", Property.sequelize.col("price")), "avgPrice"]
      ],
      where: { approved: true }
    });

    res.json({
      totalUsers,
      totalProperties,
      approvedProperties,
      pendingProperties,
      pendingLandlords,
      activeLandlords,
      usersByRole,
      averagePrice: averagePrice[0]?.dataValues?.avgPrice || 0
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all reviews
router.get("/reviews", auth, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email"]
        },
        {
          model: Property,
          as: "property",
          attributes: ["name", "location"]
        }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete review
router.delete("/reviews/:id", auth, requireAdmin, async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
