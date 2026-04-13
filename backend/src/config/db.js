const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check if we should use SQLite (for easier development without XAMPP)
const useSQLite = process.env.DB_TYPE === 'sqlite' || !process.env.DB_HOST;

let sequelize;

if (useSQLite) {
  // SQLite configuration - no XAMPP needed!
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/uniboard_dev.sqlite',
    logging: false
  });
  console.log('Using SQLite database (no XAMPP needed)');
} else {
  // MySQL/MariaDB configuration for production
  sequelize = new Sequelize(
    process.env.DB_NAME || 'uniboard_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        charset: 'utf8mb4'
      },
      define: {
        charset: 'utf8mb4'
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
  console.log('Using MySQL database');
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected ✅');
  } catch (error) {
    console.error('Database connection failed ❌:', error.message);
  }
};

module.exports = { sequelize, connectDB };
