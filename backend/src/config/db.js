const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for development, MySQL for production
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = isProduction
  ? new Sequelize(
      process.env.DB_NAME || 'uniboard_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database/uniboard_dev.db'),
      logging: false
    });

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected ✅');
  } catch (error) {
    console.log('MySQL connection failed ❌ - Running in offline mode');
    console.log('Error:', error.message);
  }
};

module.exports = { sequelize, connectDB };