const express = require("express");
const { Building, Compound, Property } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get buildings for a compound
router.get("/compound/:compoundId", auth, async (req, res) => {
  try {
    const compound = await Compound.findByPk(req.params.compoundId);

    if (!compound) {
      return res.status(404).json({ message: "Compound not found" });
    }

    if (compound.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const buildings = await Building.findAll({
      where: { compound_id: req.params.compoundId },
      include: [{
        model: Property,
        as: 'properties',
        attributes: ['id', 'name', 'approved', 'total_beds', 'occupied_beds']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(buildings);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create building
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'landlord') {
      return res.status(403).json({ message: "Only landlords can create buildings" });
    }

    const { name, compound_id } = req.body;

    // Verify compound belongs to landlord
    const compound = await Compound.findByPk(compound_id);
    if (!compound || compound.landlord_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized for this compound" });
    }

    const building = await Building.create({
      name,
      compound_id
    });

    res.status(201).json({
      message: "Building created successfully",
      building
    });
  } catch (error) {
    console.error('Error creating building:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update building
router.put("/:id", auth, async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id, {
      include: [{ model: Compound, as: 'compound' }]
    });

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    if (building.compound.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name } = req.body;

    await building.update({ name });

    res.json({ message: "Building updated successfully" });
  } catch (error) {
    console.error('Error updating building:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete building
router.delete("/:id", auth, async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id, {
      include: [{ model: Compound, as: 'compound' }]
    });

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    if (building.compound.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await building.destroy();
    res.json({ message: "Building deleted successfully" });
  } catch (error) {
    console.error('Error deleting building:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;