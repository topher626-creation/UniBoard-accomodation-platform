const express = require("express");
const { Op } = require('sequelize');
const { Property, PropertyImage, PropertyFeature, User, Building, Compound } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all properties (public - limited info for non-authenticated users)
router.get("/", async (req, res) => {
  try {
    const { search, location, approved } = req.query;

    let whereClause = {};

    // Search functionality
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
          { '$Compound.name$': { [Op.like]: `%${search}%` } },
          { '$Compound.location$': { [Op.like]: `%${search}%` } }
        ]
      };
    }

    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    // Only show approved properties for public view
    if (approved !== 'false') {
      whereClause.approved = true;
    }

    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: PropertyImage,
          as: 'images',
          limit: 1 // Only first image for listing view
        },
        {
          model: Building,
          as: 'building',
          include: [{
            model: Compound,
            as: 'compound'
          }]
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['name'] // Limited info
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format response - hide sensitive info for non-authenticated users
    const formattedProperties = properties.map(property => ({
      id: property.id,
      name: property.name,
      price: property.price,
      location: property.location,
      room_type: property.room_type,
      total_beds: property.total_beds,
      occupied_beds: property.occupied_beds,
      available_beds: property.availableBeds,
      image: property.images && property.images.length > 0 ? property.images[0].image_url : null,
      compound: property.building?.compound?.name,
      landlord_name: property.landlord?.name
    }));

    res.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get property details (full info only for authenticated users)
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: PropertyImage,
          as: 'images'
        },
        {
          model: PropertyFeature,
          as: 'features'
        },
        {
          model: Building,
          as: 'building',
          include: [{
            model: Compound,
            as: 'compound'
          }]
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'phone', 'email']
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user is authenticated
    const isAuthenticated = req.user ? true : false;

    if (!isAuthenticated && !property.approved) {
      return res.status(404).json({ message: "Property not found" });
    }

    const response = {
      id: property.id,
      name: property.name,
      description: property.description,
      location: property.location,
      price: property.price,
      room_type: property.room_type,
      total_beds: property.total_beds,
      occupied_beds: property.occupied_beds,
      available_beds: property.availableBeds,
      approved: property.approved,
      images: property.images.map(img => img.image_url),
      features: property.features.map(feat => feat.feature),
      building: property.building?.name,
      compound: property.building?.compound?.name,
      landlord: isAuthenticated ? {
        name: property.landlord?.name,
        phone: property.landlord?.phone,
        email: property.landlord?.email
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create property (landlord only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only landlords and admins can create properties" });
    }

    const {
      name,
      description,
      location,
      price,
      phone,
      whatsapp,
      room_type,
      total_beds,
      building_id,
      features,
      images
    } = req.body;

    const property = await Property.create({
      name,
      description,
      location,
      price,
      phone,
      whatsapp,
      room_type,
      total_beds: total_beds || 1,
      occupied_beds: 0,
      building_id,
      landlord_id: req.user.id
    });

    // Add features
    if (features && Array.isArray(features)) {
      const featurePromises = features.map(feature =>
        PropertyFeature.create({
          property_id: property.id,
          feature
        })
      );
      await Promise.all(featurePromises);
    }

    // Add images
    if (images && Array.isArray(images)) {
      if (images.length > 8) {
        return res.status(400).json({ message: "Maximum 8 images allowed per property" });
      }
      const imagePromises = images.map(image_url =>
        PropertyImage.create({
          property_id: property.id,
          image_url
        })
      );
      await Promise.all(imagePromises);
    }

    res.status(201).json({
      message: "Property created successfully",
      property: { id: property.id, name: property.name }
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update property (landlord only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update properties" });
    }

    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    const {
      name,
      description,
      location,
      price,
      phone,
      whatsapp,
      room_type,
      total_beds,
      occupied_beds,
      features,
      images
    } = req.body;

    await property.update({
      name,
      description,
      location,
      price,
      phone,
      whatsapp,
      room_type,
      total_beds,
      occupied_beds
    });

    // Update features
    if (features !== undefined) {
      await PropertyFeature.destroy({ where: { property_id: property.id } });
      if (Array.isArray(features)) {
        const featurePromises = features.map(feature =>
          PropertyFeature.create({
            property_id: property.id,
            feature
          })
        );
        await Promise.all(featurePromises);
      }
    }

    // Update images
    if (images !== undefined) {
      await PropertyImage.destroy({ where: { property_id: property.id } });
      if (Array.isArray(images)) {
        if (images.length > 8) {
          return res.status(400).json({ message: "Maximum 8 images allowed per property" });
        }
        const imagePromises = images.map(image_url =>
          PropertyImage.create({
            property_id: property.id,
            image_url
          })
        );
        await Promise.all(imagePromises);
      }
    }

    res.json({ message: "Property updated successfully" });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete property (landlord or admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete properties" });
    }

    const property = await Property.findByPk(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    await property.destroy();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;