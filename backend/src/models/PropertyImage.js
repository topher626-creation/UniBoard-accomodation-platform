const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PropertyImage = sequelize.define('PropertyImage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'property_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PropertyImage;