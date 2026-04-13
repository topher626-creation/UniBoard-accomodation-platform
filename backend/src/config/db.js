const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use MySQL by default. Enable SQLite explicitly with DB_TYPE=sqlite.
const dbType = (process.env.DB_TYPE || 'mysql').toLowerCase();
const useSQLite = dbType === 'sqlite';
const allowSQLiteFallback =
  process.env.DB_FALLBACK_TO_SQLITE !== 'false' &&
  process.env.NODE_ENV !== 'production';

let sequelize;
let activeDialect = 'mysql';
let storagePath = './database/uniboard_dev.sqlite';

if (useSQLite) {
  activeDialect = 'sqlite';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
  console.log('Using SQLite database');
} else {
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
    console.log(`Database connected (${activeDialect})`);
    return true;
  } catch (error) {
    console.error(`Database connection failed (${activeDialect}):`, error.message);

    if (activeDialect === 'mysql' && allowSQLiteFallback) {
      console.warn(`Falling back to SQLite at ${storagePath} for local development.`);
      activeDialect = 'sqlite';
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storagePath,
        logging: false
      });
      module.exports.sequelize = sequelize;

      await sequelize.authenticate();
      console.log(`Database connected (${activeDialect})`);
      return true;
    }

    if (activeDialect === 'mysql') {
      console.error('MySQL troubleshooting:');
      console.error('1) Ensure MySQL is running and not blocked on the configured port.');
      console.error('2) Confirm DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD are correct.');
      console.error('3) If XAMPP keeps crashing, set DB_PORT=3307 and update XAMPP my.ini to port 3307.');
    } else {
      console.error('SQLite troubleshooting: ensure sqlite3 is installed and write permissions are available.');
    }

    throw error;
  }
};

const getSequelize = () => sequelize;
const getActiveDialect = () => activeDialect;

module.exports = { sequelize, connectDB, getSequelize, getActiveDialect };
