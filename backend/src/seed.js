require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Listing = require("./models/Listing");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});

    // Create admin user
    const admin = new User({
      name: "System Administrator",
      email: "admin@uniboard.com",
      password: "admin123",
      phone: "+260955000000",
      role: "admin"
    });
    await admin.save();
    console.log("Created admin user:", admin.name);

    // Create sample landlord
    const landlord = new User({
      name: "John Property Manager",
      email: "landlord@uniboard.com",
      password: "password123",
      phone: "+260955123456",
      role: "landlord"
    });
    await landlord.save();
    console.log("Created landlord:", landlord.name);

    // Create sample student
    const student = new User({
      name: "Jane Student",
      email: "student@uniboard.com",
      password: "student123",
      phone: "+260955654321",
      role: "student"
    });
    await student.save();
    console.log("Created student:", student.name);

    // Create sample listings
    const listings = [
      {
        landlord: landlord._id,
        title: "Cozy Single Room Near UNZA",
        description: "A comfortable single room with all amenities. Perfect for students studying at the University of Zambia. Includes WiFi, shared kitchen, and laundry facilities. Walking distance to campus.",
        price: 1500,
        location: {
          general: "Near University of Zambia",
          exact: "123 Great East Road, Lusaka"
        },
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
        ],
        roomType: "single",
        amenities: ["WiFi", "Kitchen", "Laundry", "Security"],
        contactInfo: {
          phone: "+260955123456",
          email: "landlord@uniboard.com"
        }
      },
      {
        landlord: landlord._id,
        title: "Shared Apartment - Budget Friendly",
        description: "Affordable shared apartment for 3 students. Each room has study desk and chair. Common areas include living room, kitchen, and bathroom. 24/7 security guard.",
        price: 800,
        location: {
          general: "Near Cavendish University",
          exact: "45 Independence Avenue, Lusaka"
        },
        images: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400"
        ],
        roomType: "shared",
        amenities: ["WiFi", "Shared Kitchen", "Security", "Parking"],
        contactInfo: {
          phone: "+260955123456",
          email: "landlord@uniboard.com"
        }
      },
      {
        landlord: landlord._id,
        title: "Modern Studio Apartment",
        description: "Self-contained studio apartment with modern furnishings. Perfect for postgraduate students. Includes private bathroom, kitchenette, and balcony. Close to shopping centers.",
        price: 2200,
        location: {
          general: "Near Lusaka Business Park",
          exact: "78 Addis Ababa Drive, Lusaka"
        },
        images: [
          "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400",
          "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=400"
        ],
        roomType: "apartment",
        amenities: ["WiFi", "Private Kitchen", "Balcony", "Parking", "Gym Access"],
        contactInfo: {
          phone: "+260955123456",
          email: "landlord@uniboard.com"
        }
      }
    ];

    for (const listingData of listings) {
      const listing = new Listing(listingData);
      await listing.save();
      console.log("Created listing:", listing.title);
    }

    console.log("\n=== SEEDING COMPLETE ===");
    console.log("Admin login: admin@uniboard.com / admin123");
    console.log("Landlord login: landlord@uniboard.com / password123");
    console.log("Student login: student@uniboard.com / student123");
    console.log("========================");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();