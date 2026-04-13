require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { connectDB } = require("./config/db");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - restrict to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests, please try again later." }
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts, please try again in 15 minutes." }
});

// Request logging
app.use(morgan("combined"));

// Body parsing with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Load models and routes after DB connection so fallback dialect selection is respected.
    require("./models");

    app.use("/api/test", require("./routes/test"));
    app.use("/api/auth/login", authLimiter);
    app.use("/api/auth/register", authLimiter);
    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/properties", require("./routes/properties"));
    app.use("/api/compounds", require("./routes/compounds"));
    app.use("/api/buildings", require("./routes/buildings"));
    app.use("/api/admin", require("./routes/admin"));
    app.use("/api/upload", require("./routes/uploadRoute"));
    app.use("/api/reviews", require("./routes/reviews"));
    app.use("/api/bookings", require("./routes/bookings"));
    app.use("/api/favorites", require("./routes/favorites"));
    app.use("/api/users", require("./routes/users"));

    app.use((req, res) => {
      res.status(404).json({ message: "Route not found" });
    });

    app.use((err, req, res, next) => {
      console.error("Error:", err.message);

      if (process.env.NODE_ENV === "production") {
        res.status(500).json({ message: "Internal server error" });
      } else {
        res.status(500).json({ message: err.message });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup aborted due to database connection failure.");
    process.exit(1);
  }
};

startServer();
