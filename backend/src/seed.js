require("dotenv").config();
const { connectDB, sequelize } = require("./config/db");
const User = require("./models/User");
const Compound = require("./models/Compound");
const Building = require("./models/Building");
const Property = require("./models/Property");
const PropertyImage = require("./models/PropertyImage");
const PropertyFeature = require("./models/PropertyFeature");

const seedListings = [
  {
    compound: { name: "Mbachi Court", location: "Lusaka" },
    building: { name: "Block A" },
    property: {
      name: "Room 12",
      description: "Affordable single room for students near campus with reliable utilities.",
      location: "Mbachi, Lusaka",
      price: 1500,
      phone: "+260955123456",
      whatsapp: "+260955123456",
      room_type: "single",
      total_beds: 1,
      occupied_beds: 0
    },
    features: ["water", "electricity", "wifi", "security"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900"
    ]
  },
  {
    compound: { name: "Garneton Heights", location: "Kitwe" },
    building: { name: "North Wing" },
    property: {
      name: "Bedsitter 4",
      description: "A bright bedsitter with strong security, convenient access, and a student-friendly setting.",
      location: "Garneton, Kitwe",
      price: 2200,
      phone: "+260955123456",
      whatsapp: "+260955123456",
      room_type: "bedsitter",
      total_beds: 2,
      occupied_beds: 1
    },
    features: ["water", "electricity", "security", "kitchen"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900"
    ]
  },
  {
    compound: { name: "Pathfinder Residences", location: "Lusaka" },
    building: { name: "Studio Block" },
    property: {
      name: "Studio 8",
      description: "Self-contained room with privacy, clean finishes, and quick access to study areas and shops.",
      location: "Pathfinder, Lusaka",
      price: 3200,
      phone: "+260955123456",
      whatsapp: "+260955123456",
      room_type: "self-contained",
      total_beds: 1,
      occupied_beds: 0
    },
    features: ["water", "electricity", "wifi", "kitchen", "toilet"],
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=900",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=900"
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();

    await User.sync();
    await Compound.sync();
    await Building.sync();
    await Property.sync();
    await PropertyImage.sync();
    await PropertyFeature.sync();

    await PropertyFeature.destroy({ where: {} });
    await PropertyImage.destroy({ where: {} });
    await Property.destroy({ where: {} });
    await Building.destroy({ where: {} });
    await Compound.destroy({ where: {} });
    await User.destroy({ where: {} });

    const admin = await User.create({
      name: "System Administrator",
      email: "admin@uniboard.com",
      password: "admin12345",
      phone: "+260955000000",
      role: "admin"
    });

    const landlord = await User.create({
      name: "John Property Manager",
      email: "landlord@uniboard.com",
      password: "password123",
      phone: "+260955123456",
      role: "landlord"
    });

    const student = await User.create({
      name: "Jane Student",
      email: "student@uniboard.com",
      password: "student123",
      phone: "+260955654321",
      role: "student"
    });

    for (const entry of seedListings) {
      const compound = await Compound.create({ ...entry.compound, landlord_id: landlord.id });
      const building = await Building.create({ ...entry.building, compound_id: compound.id });
      const property = await Property.create({
        ...entry.property,
        building_id: building.id,
        landlord_id: landlord.id,
        approved: true
      });

      await Promise.all(entry.images.map((image_url) => PropertyImage.create({ property_id: property.id, image_url })));
      await Promise.all(entry.features.map((feature) => PropertyFeature.create({ property_id: property.id, feature })));
    }

    console.log("\n=== SEEDING COMPLETE ===");
    console.log(`Created admin user: ${admin.email}`);
    console.log(`Created landlord user: ${landlord.email}`);
    console.log(`Created student user: ${student.email}`);
    console.log(`Created ${seedListings.length} sample properties`);
    console.log("Admin login: admin@uniboard.com / admin12345");
    console.log("Landlord login: landlord@uniboard.com / password123");
    console.log("Student login: student@uniboard.com / student123");
    console.log("========================\n");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seedData();
