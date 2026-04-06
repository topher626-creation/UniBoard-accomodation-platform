require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

// Import models to ensure associations are set up
require("./models");

const app = express();

// Connect to MySQL
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/compounds", require("./routes/compounds"));
app.use("/api/buildings", require("./routes/buildings"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/uploadRoute"));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "UniBoard API is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});