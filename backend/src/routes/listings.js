const express = require("express");
const { Listing, User } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all listings with visibility control
router.get("/", async (req, res) => {
  try {
    const { area } = req.query;

    // Try to fetch from database first
    let listings = [];
    let dbAvailable = false;

    try {
      let whereClause = { availability: true };
      if (area) {
        whereClause.location_area = area;
      }

      listings = await Listing.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'landlord',
            attributes: ['name', 'email', 'phone']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      dbAvailable = true;
    } catch (dbError) {
      console.log("Database not available, using mock data");
    }

    // If no listings in DB or DB not available, use mock data
    if (!dbAvailable || listings.length === 0) {
      let mockListings = [
        {
          id: "1",
          title: "Cozy Single Room Near UNZA",
          price: 1500,
          room_type: "single",
          created_at: new Date().toISOString(),
          location_area: "Garneton",
          location: { general: "Near University of Zambia", exact: "123 Great East Road, Lusaka" },
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
          description: "A comfortable single room with all amenities. Perfect for students studying at the University of Zambia. Includes WiFi, shared kitchen, and laundry facilities. Walking distance to campus.",
          amenities: ["WiFi", "Kitchen", "Laundry", "Security"],
          contact_info: { phone: "+260955123456", email: "landlord@uniboard.com" },
          landlord: { name: "John Property Manager", email: "landlord@uniboard.com", phone: "+260955123456" }
        },
        {
          id: "2",
          title: "Shared Apartment - Budget Friendly",
          price: 800,
          room_type: "shared",
          created_at: new Date().toISOString(),
          location_area: "Zambia Compound",
          location: { general: "Near Cavendish University", exact: "45 Independence Avenue, Lusaka" },
          images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
          description: "Affordable shared apartment for 3 students. Each room has study desk and chair. Common areas include living room, kitchen, and bathroom. 24/7 security guard.",
          amenities: ["WiFi", "Shared Kitchen", "Security", "Parking"],
          contact_info: { phone: "+260955123456", email: "landlord@uniboard.com" },
          landlord: { name: "John Property Manager", email: "landlord@uniboard.com", phone: "+260955123456" }
        },
        {
          id: "3",
          title: "Modern Studio Apartment",
          price: 2200,
          room_type: "apartment",
          created_at: new Date().toISOString(),
          location_area: "Halawa",
          location: { general: "Near Lusaka Business Park", exact: "78 Addis Ababa Drive, Lusaka" },
          images: ["https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400"],
          description: "Self-contained studio apartment with modern furnishings. Perfect for postgraduate students. Includes private bathroom, kitchenette, and balcony. Close to shopping centers.",
          amenities: ["WiFi", "Private Kitchen", "Balcony", "Parking", "Gym Access"],
          contact_info: { phone: "+260955123456", email: "landlord@uniboard.com" },
          landlord: { name: "John Property Manager", email: "landlord@uniboard.com", phone: "+260955123456" }
        }
      ];

      // Filter by area if specified
      if (area) {
        mockListings = mockListings.filter(listing => listing.location_area === area);
      }

      listings = mockListings;
    }

    // Check if user is authenticated
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let isAuthenticated = false;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        jwt.verify(token, process.env.JWT_SECRET);
        isAuthenticated = true;
      } catch (error) {
        // Token invalid, treat as guest
      }
    }

    // Transform listings based on visibility
    const transformedListings = listings.map(listing => {
      const baseData = {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        room_type: listing.room_type,
        created_at: listing.created_at
      };

      if (!isAuthenticated) {
        // Guest view: limited information
        return {
          ...baseData,
          location: {
            general: listing.location?.general || listing.location
          },
          images: listing.images?.slice(0, 1) || [listing.images],
          description: (listing.description || "").substring(0, 100) + "...",
          isPreview: true,
          requiresAuth: true
        };
      } else {
        // Authenticated view: full information
        return {
          ...baseData,
          description: listing.description,
          location: listing.location,
          images: listing.images,
          amenities: listing.amenities,
          contact_info: listing.contact_info,
          landlord: listing.landlord || listing.landlord,
          isPreview: false
        };
      }
    });

    res.json(transformedListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single listing with visibility control
router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    if (!listing || !listing.availability) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check authentication
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let isAuthenticated = false;
    let currentUser = null;

    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUser = await User.findByPk(decoded.userId);
        isAuthenticated = true;
      } catch (error) {
        // Token invalid
      }
    }

    const baseData = {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      room_type: listing.room_type,
      created_at: listing.created_at
    };

    if (!isAuthenticated) {
      // Guest view
      return res.json({
        ...baseData,
        location: { general: listing.location.general },
        images: listing.images.slice(0, 1),
        description: listing.description.substring(0, 100) + "...",
        isPreview: true,
        requiresAuth: true,
        message: "Please login or register to view full property details."
      });
    }

    // Full view for authenticated users
    const fullData = {
      ...baseData,
      description: listing.description,
      location: listing.location,
      images: listing.images,
      amenities: listing.amenities,
      landlord_phone_number: listing.landlord_phone_number,
      payment_instructions: listing.payment_instructions,
      contact_info: listing.contact_info,
      landlord: listing.landlord,
      isPreview: false
    };

    // Add edit permissions for landlord owner
    if (currentUser && currentUser.id === listing.landlord_id) {
      fullData.isOwner = true;
    }

    res.json(fullData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create listing (landlords only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "landlord" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only landlords can create listings" });
    }

    if (req.user.role === "landlord" && req.user.status !== "active") {
      return res.status(403).json({ message: "Your landlord account is awaiting admin approval" });
    }

    const listing = await Listing.create({
      ...req.body,
      landlord_id: req.user.id
    });

    // Fetch the created listing with landlord data
    const listingWithLandlord = await Listing.findByPk(listing.id, {
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    res.status(201).json({
      message: "Listing created successfully",
      listing: listingWithLandlord
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update listing (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.landlord_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role === "landlord" && req.user.status !== "active") {
      return res.status(403).json({ message: "Your landlord account is awaiting admin approval" });
    }

    Object.assign(listing, req.body);
    await listing.save();

    // Fetch updated listing with landlord data
    const updatedListing = await Listing.findByPk(listing.id, {
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'email', 'phone']
        }
      ]
    });

    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete listing (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.landlord_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role === "landlord" && req.user.status !== "active") {
      return res.status(403).json({ message: "Your landlord account is awaiting admin approval" });
    }

    await listing.destroy();
    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get listings by landlord
router.get("/landlord/:landlordId", auth, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.landlordId) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const listings = await Listing.findAll({
      where: { landlord_id: req.params.landlordId },
      include: [
        {
          model: User,
          as: 'landlord',
          attributes: ['name', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;