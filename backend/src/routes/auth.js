const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
const SELF_REGISTER_ROLES = ["student", "landlord"];
const USER_STATUSES = ["pending", "active", "disabled"];

const isValidEmail = (value = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());

const signAuthToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRY || "7d"
  });

// Register
router.post("/register", async (req, res) => {
  try {
const { name, email, password, phone, role, business_name, verification_document_url, nrc } = req.body;
    const normalizedName = (name || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedRole = role || "student";
    const normalizedBusinessName = (business_name || "").trim();
    const normalizedPhone = (phone || "").trim();
const normalizedVerificationDocUrl = (verification_document_url || "").trim();
  const normalizedNrcUrl = (nrc || "").trim();

    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (!SELF_REGISTER_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid registration role" });
    }

    if (normalizedRole === "landlord" && !normalizedBusinessName) {
      return res.status(400).json({ message: "Business or compound name is required for landlords" });
    }

    if (normalizedRole === "landlord" && normalizedVerificationDocUrl && !normalizedVerificationDocUrl.startsWith('http')) {
      return res.status(400).json({ message: "Invalid verification document URL" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    let verificationUrl = null;
    if (normalizedRole === "landlord" && normalizedVerificationDocUrl) {
      verificationUrl = `${req.protocol}://${req.get('host')}/admin/verify/${crypto.randomUUID()}`;
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      phone: normalizedPhone || null,
      role: normalizedRole,
      business_name: normalizedRole === "landlord" ? normalizedBusinessName : null,
      verification_document_url: normalizedVerificationDocUrl || null,
      verification_url: verificationUrl,
      nrc_url: normalizedNrcUrl || null,
      status: normalizedRole === "landlord" ? "pending" : "active",
      isVerified: normalizedRole === "student"
    });

    // Generate token
    const token = signAuthToken(user.id);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      business_name: user.business_name,
      status: user.status,
      isVerified: user.isVerified,
      verification_url: user.verification_url
    };

    res.status(201).json({
      message:
        normalizedRole === "landlord"
          ? `Landlord account created (ID: ${user.id}). Awaiting admin approval. Verification link: ${user.verification_url || 'N/A'}`
          : "User registered successfully",
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.is_banned) {
      return res.status(403).json({ message: "Account suspended. Contact admin." });
    }

    if (user.status === "disabled") {
      return res.status(403).json({ message: "Account disabled. Contact admin." });
    }

    if (!USER_STATUSES.includes(user.status)) {
      return res.status(403).json({ message: "Account status is invalid. Contact admin." });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = signAuthToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        business_name: user.business_name,
        status: user.status,
        isVerified: user.isVerified,
        is_banned: user.is_banned
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      business_name: req.user.business_name,
      status: req.user.status,
      isVerified: req.user.isVerified
    }
  });
});

module.exports = router;
