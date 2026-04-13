const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  location_area: {
    type: DataTypes.ENUM('Garneton', 'Zambia Compound', 'Halawa', 'Pathfinder', 'Big Brothers'),
    allowNull: false
  },
  location_general: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  location_exact: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON, // Store as JSON array of Cloudinary URLs
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  room_type: {
    type: DataTypes.ENUM('single', 'shared', 'apartment', 'house'),
    defaultValue: 'single'
  },
  amenities: {
    type: DataTypes.JSON, // Store as JSON array
    defaultValue: []
  },
  landlord_phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  payment_instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  visibility: {
    type: DataTypes.ENUM('public', 'authenticated', 'private'),
    defaultValue: 'authenticated'
  },
  contact_info: {
    type: DataTypes.JSON, // Store phone and email as JSON
    defaultValue: {}
  }
}, {
  tableName: 'listings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Listing;