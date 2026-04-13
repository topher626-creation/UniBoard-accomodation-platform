# UniBoard - Database Setup Guide

## Option 1: Fix XAMPP MySQL

0. **Check Windows MySQL service first (common conflict):**
   - Open `services.msc`
   - Find `MySQL` / `MySQL96` / `MariaDB`
   - If present, set Startup Type to `Manual` or `Automatic` and start it
   - Or keep it stopped and make sure XAMPP uses a different port than that service

1. **Check port conflict:**
   - Open XAMPP -> Config -> my.ini
   - Change `port=3306` to `port=3307`
   - Update `backend/.env`: `DB_PORT=3307`

2. **Fix permissions:**
   - Right-click XAMPP -> Run as Administrator
   - Click "MySQL" -> "Logs" -> "error.log"
   - Look for: "InnoDB: Operating system error number 5"

3. **Common fix:**
   - Stop MySQL in XAMPP
   - Go to `C:\xampp\mysql\data`
   - Delete `ibdata1` file (backup first!)
   - Restart MySQL

## Option 2: Use SQLite Instead (Easier for Development)

Replace MySQL with SQLite in `backend/src/config/db.js`:

```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/uniboard_dev.sqlite',
  logging: false
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connected ✅');
  } catch (error) {
    console.error('Database connection failed ❌:', error.message);
  }
};

module.exports = { sequelize, connectDB };
```

Then update `backend/.env`:
```
DB_TYPE=sqlite
```

## Option 3: Use Docker MySQL

```bash
docker run -d -p 3306:3306 --name uniboard-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=uniboard_db \
  mysql:latest
```

## Quick Fix - Start Frontend Only

The frontend can run without the backend for UI testing:

```bash
npm run dev:frontend
```

Then visit `http://localhost:5173`
