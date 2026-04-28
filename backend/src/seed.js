const { sequelize } = require('./config/db');
const User = require('./models/User');
const Property = require('./models/Property');
require('./models'); // Load all models

const seedData = async () => {
  await sequelize.sync({ force: true }); // Reset DB
  
  // Admin
  await User.create({
    name: 'Admin User',
    email: 'admin@uniboard.com',
    password: await User.hashPassword('admin123'),
    role: 'admin',
    status: 'active',
    isVerified: true
  });

  // Test users
  await User.create({
    name: 'Test Student',
    email: 'student@test.com',
    password: await User.hashPassword('123456'),
    role: 'student'
  });
  
  await User.create({
    name: 'Test Landlord',
    email: 'landlord@test.com',
    password: await User.hashPassword('123456'),
    role: 'landlord',
    business_name: 'EGGS CITY',
    status: 'pending'
  });

  // Test properties
  await Property.create({
    title: 'Eggs city',
    description: 'Perfect for students',
    price_per_month: 500000,
    location: 'Garneton plot 12',
    beds: 1,
    bathrooms: 1,
    user_id: 2 // Landlord
  });

  console.log('✅ Seed complete! Admin: admin@uniboard.com / admin123');
  process.exit(0);
};

seedData().catch(console.error);

