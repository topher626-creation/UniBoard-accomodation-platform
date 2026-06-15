const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
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
  name: {
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
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  distance_from_campus_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.JSON, // Store as JSON array of Cloudinary URLs
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  total_bedspaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  occupied_bedspaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  whatsapp_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  room_type: {
    type: DataTypes.ENUM('single', 'bankers room', 'shared room', 'self-contained'),
    defaultValue: 'single'
  },
  amenities: {
    type: DataTypes.JSON, // Store as JSON array
    defaultValue: []
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  getterMethods: {
    available_bedspaces() {
      return this.total_bedspaces - this.occupied_bedspaces;
    }
  }
});

module.exports = Property;