const express = require("express");
const { Favorite, Property, PropertyImage, Building, Compound } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get user's favorites
router.get("/", auth, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
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

    const formattedFavorites = favorites.map(fav => ({
      id: fav.id,
      created_at: fav.created_at,
      property: fav.property ? {
        id: fav.property.id,
        name: fav.property.name,
        location: fav.property.location,
        price: fav.property.price,
        room_type: fav.property.room_type,
        available_beds: fav.property.total_beds - fav.property.occupied_beds,
        image: fav.property.images && fav.property.images.length > 0 
          ? fav.property.images[0].image_url : null,
        compound: fav.property.building?.compound?.name,
        building: fav.property.building?.name
      } : null
    }));

    res.json(formattedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add to favorites
router.post("/", auth, async (req, res) => {
  try {
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Check property exists
    const property = await Property.findByPk(property_id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        property_id
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Property already in favorites" });
    }

    const favorite = await Favorite.create({
      user_id: req.user.id,
      property_id
    });

    res.status(201).json({
      message: "Added to favorites",
      favorite: { id: favorite.id, property_id: favorite.property_id }
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: error.message });
  }
});

// Remove from favorites
router.delete("/:propertyId", auth, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        property_id: propertyId
      }
    });

    if (!favorite) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    await favorite.destroy();

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: error.message });
  }
});

// Check if property is favorited
router.get("/check/:propertyId", auth, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        property_id: propertyId
      }
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
