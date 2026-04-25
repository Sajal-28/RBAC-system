/**
 * @file routes/userRoutes.js
 * @description Route definitions for user-related endpoints, including RBAC protected admin routes.
 */

const express = require("express");
const {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats,
  getOwnProfile,
  updateOwnProfile
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

/**
 * User Profile Routes
 * Access: Private (Authenticated users)
 */
router.get("/profile", protect, getOwnProfile);
router.put("/profile", protect, updateOwnProfile);

/**
 * Admin Management Routes
 * Access: Private (Admin only)
 */
router.get("/stats", protect, authorizeAdmin, getSystemStats);
router.get("/", protect, authorizeAdmin, getAllUsers);
router.post("/", protect, authorizeAdmin, createUserByAdmin);
router.put("/:id", protect, authorizeAdmin, updateUserByAdmin);
router.delete("/:id", protect, authorizeAdmin, deleteUserByAdmin);

module.exports = router;
