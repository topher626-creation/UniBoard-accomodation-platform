const express = require("express");
const { Op, literal } = require('sequelize');
const jwt = require("jsonwebtoken");
const { Property, PropertyImage, PropertyFeature, User, Review } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

const getAvailabilityStatus = (availableBeds) => {
  if (availableBeds <= 0) return "FULL";
  if (availableBeds <= 5) return "LOW";
  return "AVAILABLE";
};

const getOptionalUser = async (req) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7).trim();
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { id: decoded.userId };
  } catch {
    return null;
  }
};

// Get all properties with advanced filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { 
      search, 
      location, 
      approved,
      price_min,
      price_max,
      room_type,
      available_only,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    let whereClause = {};

    // Search functionality
    if (search) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { location: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
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

    // Price range filter
    if (price_min || price_max) {
      whereClause.price = {};
      if (price_min) whereClause.price[Op.gte] = Number(price_min);
      if (price_max) whereClause.price[Op.lte] = Number(price_max);
    }

    // Room type filter
    if (room_type) {
      const roomTypes = room_type.split(',').map(r => r.trim());
      whereClause.room_type = { [Op.in]: roomTypes };
    }

    // Availability filter
    if (available_only === 'true') {
      whereClause[Op.and] = [
        literal('`properties`.`total_bedspaces` - `properties`.`occupied_bedspaces` > 0')
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Sorting
    const validSortFields = ['created_at', 'price', 'name', 'total_bedspaces'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyImage,
          as: 'images',
          limit: 1
        },
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'business_name']
        }
      ],
      order: [[sortField, sortDirection]],
      limit: limitNum,
      offset: offset,
      distinct: true
    });

    // Format response
    const formattedProperties = properties.map(property => ({
      available_bedspaces: property.total_bedspaces - property.occupied_bedspaces,
      availability_status: getAvailabilityStatus(property.total_bedspaces - property.occupied_bedspaces),
      id: property.id,
      name: property.name,
      price: property.price,
      location: property.location,
      distance_from_campus_minutes: property.distance_from_campus_minutes,
      room_type: property.room_type,
      total_bedspaces: property.total_bedspaces,
      occupied_bedspaces: property.occupied_bedspaces,
      image: property.images && property.images.length > 0 ? property.images[0].image_url : null,
      business_name: property.landlord?.business_name,
      landlord_name: property.landlord?.name
    }));

    res.json({
      properties: formattedProperties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
        hasMore: pageNum * limitNum < count
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get landlord/admin properties
router.get("/mine", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const whereClause = req.user.role === "admin" ? {} : { landlord_id: req.user.id };
    const properties = await Property.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'business_name']
        }
      ],
      order: [["created_at", "DESC"]]
    });

    const formatted = properties.map((property) => ({
      id: property.id,
      name: property.name,
      location: property.location,
      distance_from_campus_minutes: property.distance_from_campus_minutes,
      price: property.price,
      approved: property.approved,
      total_bedspaces: property.total_bedspaces,
      occupied_bedspaces: property.occupied_bedspaces,
      available_bedspaces: property.total_bedspaces - property.occupied_bedspaces,
      availability_status: getAvailabilityStatus(property.total_bedspaces - property.occupied_bedspaces),
      business_name: property.landlord?.business_name,
      room_type: property.room_type
    }));

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch your properties" });
  }
});

// Get property details (guest vs authenticated access model)
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
          model: User,
          as: 'landlord',
          attributes: ['name', 'phone', 'email', 'business_name']
        },
        {
          model: Review,
          as: 'reviews',
          limit: 10,
          order: [['created_at', 'DESC']],
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const optionalUser = await getOptionalUser(req);
    const isAuthenticated = Boolean(optionalUser);
    const isGuest = !isAuthenticated;

    if (!isAuthenticated && !property.approved) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Calculate average rating
    const totalRating = property.reviews ? property.reviews.reduce((sum, review) => sum + review.rating, 0) : 0;
    const reviewCount = property.reviews ? property.reviews.length : 0;
    const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

    const response = {
      id: property.id,
      name: property.name,
      description: isGuest ? property.description.substring(0, 100) + '...' : property.description,
      location: property.location,
      distance_from_campus_minutes: property.distance_from_campus_minutes,
      price: property.price,
      room_type: property.room_type,
      total_bedspaces: isGuest ? null : property.total_bedspaces,
      occupied_bedspaces: isGuest ? null : property.occupied_bedspaces,
      available_bedspaces: isGuest ? null : (property.total_bedspaces - property.occupied_bedspaces),
      availability_status: isGuest ? null : getAvailabilityStatus(property.total_bedspaces - property.occupied_bedspaces),
      approved: property.approved,
      images: isGuest ? (property.images[0] ? [property.images[0].image_url] : []) : property.images.map(img => img.image_url),
      amenities: isGuest ? [] : property.amenities,
      average_rating: parseFloat(averageRating),
      review_count: reviewCount,
      business_name: property.landlord?.business_name,
      landlord: isGuest ? { name: property.landlord?.name } : {
        name: property.landlord?.name,
        business_name: property.landlord?.business_name,
        phone: property.phone_number || property.landlord?.phone,
        whatsapp: property.whatsapp_number || property.landlord?.phone,
        email: property.landlord?.email || null
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create property (landlord only - requires approval)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only landlords and admins can create properties" });
    }

    if (req.user.role === "landlord" && req.user.status !== "active") {
      return res.status(403).json({ message: "Your landlord account is awaiting admin approval" });
    }

    const {
      name,
      description,
      location,
      distance_from_campus_minutes,
      price,
      phone_number,
      whatsapp_number,
      room_type,
      total_bedspaces,
      occupied_bedspaces,
      amenities,
      images
    } = req.body;

    const allowedRoomTypes = ["single", "bankers room", "shared room", "self-contained"];
    const parsedPrice = Number(price);
    const parsedTotalBedspaces = Number(total_bedspaces);
    const parsedOccupiedBedspaces = occupied_bedspaces === undefined ? 0 : Number(occupied_bedspaces);
    const parsedDistance = distance_from_campus_minutes ? Number(distance_from_campus_minutes) : null;

    // Validation
    if (!name || !description || !location || !phone_number || !room_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!allowedRoomTypes.includes(room_type)) {
      return res.status(400).json({ message: "Invalid room type" });
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Price must be a valid non-negative number" });
    }
    if (!Number.isInteger(parsedTotalBedspaces) || parsedTotalBedspaces < 1) {
      return res.status(400).json({ message: "Total bedspaces must be an integer >= 1" });
    }
    if (!Number.isInteger(parsedOccupiedBedspaces) || parsedOccupiedBedspaces < 0 || parsedOccupiedBedspaces > parsedTotalBedspaces) {
      return res.status(400).json({ message: "Occupied bedspaces must be between 0 and total bedspaces" });
    }
    if (images && (!Array.isArray(images) || images.length > 12)) {
      return res.status(400).json({ message: "Maximum 12 images allowed per property" });
    }

    const property = await Property.create({
      name,
      description,
      location,
      distance_from_campus_minutes: parsedDistance,
      price: parsedPrice,
      phone_number,
      whatsapp_number: whatsapp_number || null,
      room_type,
      total_bedspaces: parsedTotalBedspaces,
      occupied_bedspaces: parsedOccupiedBedspaces,
      amenities: amenities || [],
      landlord_id: req.user.id,
      approved: false // Properties require admin approval
    });

    // Add images
    if (images && Array.isArray(images)) {
      const imagePromises = images.map(image_url =>
        PropertyImage.create({
          property_id: property.id,
          image_url
        })
      );
      await Promise.all(imagePromises);
    }

    res.status(201).json({
      message: "Property created successfully. Awaiting admin approval.",
      property: { id: property.id, name: property.name, approved: false }
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

    if (req.user.role === "landlord" && req.user.status !== "active") {
      return res.status(403).json({ message: "Your landlord account is awaiting admin approval" });
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
      distance_from_campus_minutes,
      price,
      phone_number,
      whatsapp_number,
      room_type,
      total_bedspaces,
      occupied_bedspaces,
      amenities,
      images
    } = req.body;

    await property.update({
      name,
      description,
      location,
      distance_from_campus_minutes,
      price,
      phone_number,
      whatsapp_number,
      room_type,
      total_bedspaces,
      occupied_bedspaces,
      amenities
    });

    // Update images
    if (images !== undefined) {
      await PropertyImage.destroy({ where: { property_id: property.id } });
      if (Array.isArray(images) && images.length > 0) {
        const imagePromises = images.map(image_url =>
          PropertyImage.create({
            property_id: property.id,
            image_url
          })
        );
        await Promise.all(imagePromises);
      }
    }

    res.json({
      message: "Property updated successfully",
      property: { id: property.id, name: property.name }
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete property (landlord/admin only)
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

    await PropertyImage.destroy({ where: { property_id: property.id } });
    await PropertyFeature.destroy({ where: { property_id: property.id } });
    await property.destroy();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
