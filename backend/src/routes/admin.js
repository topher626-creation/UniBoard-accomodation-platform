const express = require("express");
const { User, Property, PropertyImage, PropertyFeature, Compound, Building, Review } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.get("/users", auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]]
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "landlord", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ role });

    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
});

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
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }
    });
    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ban status" });
  }
});

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

router.get("/properties", auth, requireAdmin, async (req, res) => {
  try {
    const properties = await Property.findAll({
      include: [
        {
          model: User,
          as: "landlord",
          attributes: ["name", "email"]
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

    let nextOccupied = property.occupied_beds;
    if (action === "increment") {
      if (property.occupied_beds >= property.total_beds) {
        return res.status(400).json({ message: "Property is already full" });
      }
      nextOccupied += 1;
    } else {
      if (property.occupied_beds <= 0) {
        return res.status(400).json({ message: "Occupied beds cannot go below 0" });
      }
      nextOccupied -= 1;
    }

    await property.update({ occupied_beds: nextOccupied });
    return res.json({
      message: "Occupancy updated successfully",
      property: {
        id: property.id,
        total_beds: property.total_beds,
        occupied_beds: nextOccupied,
        available_beds: property.total_beds - nextOccupied
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update occupancy" });
  }
});

router.put("/properties/:id", auth, requireAdmin, async (req, res) => {
  try {
    const { approved } = req.body;

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

    await property.update({ approved });

    res.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: error.message });
  }
});

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

router.get("/compounds", auth, requireAdmin, async (req, res) => {
  try {
    const compounds = await Compound.findAll({
      include: [
        { model: User, as: "landlord", attributes: ["name", "email"] },
        { model: Building, as: "buildings", attributes: ["id", "name"] }
      ],
      order: [["created_at", "DESC"]]
    });
    return res.json(compounds);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch compounds" });
  }
});

router.delete("/compounds/:id", auth, requireAdmin, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);
    if (!compound) {
      return res.status(404).json({ message: "Compound not found" });
    }

    await compound.destroy();
    return res.json({ message: "Compound deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete compound" });
  }
});

router.get("/stats", auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProperties = await Property.count();
    const approvedProperties = await Property.count({ where: { approved: true } });
    const pendingProperties = await Property.count({ where: { approved: false } });

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
      totalBookings: 0,
      totalRevenue: 0,
      usersByRole,
      averagePrice: averagePrice[0]?.dataValues?.avgPrice || 0
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: error.message });
  }
});

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
          as: "listing",
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
