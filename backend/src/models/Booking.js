const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id"
    }
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "properties",
      key: "id"
    }
  },
  status: {
    type: DataTypes.ENUM("PENDING", "CONFIRMED", "REJECTED", "CANCELLED"),
    defaultValue: "PENDING"
  },
  payment_proof_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  payment_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejected_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "bookings",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
});

module.exports = Booking;