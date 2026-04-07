const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
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
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();

    const queryInterface = sequelize.getQueryInterface();
    const usersTable = await queryInterface.describeTable('users');
    if (!usersTable.is_banned) {
      await queryInterface.addColumn('users', 'is_banned', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    }

    console.log('MySQL connected (XAMPP) ✅');
  } catch (error) {
    console.error('MySQL connection failed ❌:', error.message);
  }
};

module.exports = { sequelize, connectDB };