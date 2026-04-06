const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Building = sequelize.define('Building', {
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
  compound_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'compounds',
      key: 'id'
    }
  }
}, {
  tableName: 'buildings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Building;