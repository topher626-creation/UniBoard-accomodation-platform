const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");

// Health check - tests database connection
router.get("/health", async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.json({
      success: true,
      message: "UniBoard API is healthy! 🎉",
      database: "Connected ✅",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Database info
router.get("/db-info", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "mysql",
      status: "Connected ✅"
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Welcome message
router.get("/welcome", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to UniBoard Student Accommodation Platform API 🚀",
    version: "1.0.0",
    endpoints: {
      health: "/api/test/health",
      dbInfo: "/api/test/db-info",
      welcome: "/api/test/welcome",
      auth: "/api/auth",
      properties: "/api/properties"
    }
  });
});

module.exports = router;
