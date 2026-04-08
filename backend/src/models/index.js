const { sequelize } = require('../config/db');

// Import models
const User = require('./User');
const Compound = require('./Compound');
const Building = require('./Building');
const Property = require('./Property');
const PropertyImage = require('./PropertyImage');
const PropertyFeature = require('./PropertyFeature');
const Review = require('./Review');

// Define associations
User.hasMany(Compound, { foreignKey: 'landlord_id', as: 'compounds' });
Compound.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

Compound.hasMany(Building, { foreignKey: 'compound_id', as: 'buildings' });
Building.belongsTo(Compound, { foreignKey: 'compound_id', as: 'compound' });

Building.hasMany(Property, { foreignKey: 'building_id', as: 'properties' });
Property.belongsTo(Building, { foreignKey: 'building_id', as: 'building' });

User.hasMany(Property, { foreignKey: 'landlord_id', as: 'properties' });
Property.belongsTo(User, { foreignKey: 'landlord_id', as: 'landlord' });

Property.hasMany(PropertyImage, { foreignKey: 'property_id', as: 'images' });
PropertyImage.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

Property.hasMany(PropertyFeature, { foreignKey: 'property_id', as: 'features' });
PropertyFeature.belongsTo(Property, { foreignKey: 'property_id', as: 'property' });

// Review associations
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Property.hasMany(Review, { foreignKey: 'listing_id', as: 'reviews' });
Review.belongsTo(Property, { foreignKey: 'listing_id', as: 'listing' });

// Sync database (only in development)
if (process.env.NODE_ENV !== 'production') {
  sequelize.sync({ alter: false }).then(() => {
    console.log('Database synced successfully');
  }).catch(err => {
    console.error('Error syncing database:', err);
  });
}

module.exports = {
  sequelize,
  User,
  Compound,
  Building,
  Property,
  PropertyImage,
  PropertyFeature,
  Review
};