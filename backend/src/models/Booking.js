const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  move_in_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  duration_months: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  payment_proof_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  payment_proof_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'image'
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: false,
      fields: ['user_id', 'property_id']
    },
    {
      unique: false,
      fields: ['status']
    }
  ]
});

module.exports = Booking;
