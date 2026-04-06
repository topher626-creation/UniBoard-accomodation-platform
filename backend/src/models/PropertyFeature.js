const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PropertyFeature = sequelize.define('PropertyFeature', {
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
  feature: {
    type: DataTypes.ENUM('water', 'electricity', 'wifi', 'security', 'kitchen', 'toilet'),
    allowNull: false
  }
}, {
  tableName: 'property_features',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['property_id', 'feature']
    }
  ]
});

module.exports = PropertyFeature;