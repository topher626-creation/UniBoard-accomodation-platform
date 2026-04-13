const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  room_type: {
    type: DataTypes.ENUM('single', 'bedsitter', 'self-contained', 'bunkered'),
    allowNull: true
  },
  total_beds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  occupied_beds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  building_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'buildings',
      key: 'id'
    }
  },
  landlord_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
    availableBeds() {
      return this.total_beds - this.occupied_beds;
    }
  }
});

module.exports = Property;
