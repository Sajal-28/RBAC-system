/**
 * @file routes/authRoutes.js
 * @description Route definitions for authentication-related endpoints.
 */

const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Private routes (protected by JWT)
router.get("/me", protect, getCurrentUser);

module.exports = router;
