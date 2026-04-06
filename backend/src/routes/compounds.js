const express = require("express");
const { Compound, Building, Property } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all compounds for a landlord
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    let whereClause = {};
    if (req.user.role === 'landlord') {
      whereClause.landlord_id = req.user.id;
    }

    const compounds = await Compound.findAll({
      where: whereClause,
      include: [
        {
          model: Building,
          as: 'buildings',
          include: [{
            model: Property,
            as: 'properties',
            attributes: ['id', 'name', 'approved']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(compounds);
  } catch (error) {
    console.error('Error fetching compounds:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create compound
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Only landlords can create compounds" });
    }

    const { name, location } = req.body;

    const compound = await Compound.create({
      name,
      location,
      landlord_id: req.user.id
    });

    res.status(201).json({
      message: "Compound created successfully",
      compound
    });
  } catch (error) {
    console.error('Error creating compound:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update compound
router.put("/:id", auth, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);

    if (!compound) {
      return res.status(404).json({ message: "Compound not found" });
    }

    if (compound.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, location } = req.body;

    await compound.update({ name, location });

    res.json({ message: "Compound updated successfully" });
  } catch (error) {
    console.error('Error updating compound:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete compound
router.delete("/:id", auth, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.id);

    if (!compound) {
      return res.status(404).json({ message: "Compound not found" });
    }

    if (compound.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await compound.destroy();
    res.json({ message: "Compound deleted successfully" });
  } catch (error) {
    console.error('Error deleting compound:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;