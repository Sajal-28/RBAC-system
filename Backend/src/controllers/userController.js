/**
 * @file controllers/userController.js
 * @description Controllers for user-related operations, including profile management and admin user management.
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  
  // Build query: filter by role if provided, otherwise fetch all
  const query = role ? { role } : {};
  
  const users = await User.find(query).select("-password").sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users
  });
});

/**
 * @desc    Create a new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUserByAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  // Validate role if provided
  if (role && !["admin", "user"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role. Must be 'admin' or 'user'");
  }

  // Create new user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role || "user"
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * @desc    Update user by ID (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  // Prevent self-management through this route
  if (id === req.user._id.toString()) {
    res.status(403);
    throw new Error("Admins cannot edit their own account through the management panel. Please use the Profile page.");
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent editing other admins
  if (user.role === "admin") {
    res.status(403);
    throw new Error("You do not have permission to modify another administrator's account");
  }

  // Update fields if provided
  if (name) user.name = name;
  
  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    user.email = email.toLowerCase();
  }

  if (role) {
    // Validate role
    if (!["admin", "user"].includes(role)) {
      res.status(400);
      throw new Error("Invalid role. Must be 'admin' or 'user'");
    }

    // Prevent self-demotion
    if (id === req.user._id.toString() && role !== "admin") {
      res.status(403);
      throw new Error("You cannot demote yourself from the admin role");
    }
    user.role = role;
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

/**
 * @desc    Delete user by ID (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent deleting other admins
  if (user.role === "admin") {
    res.status(403);
    throw new Error("Administrators cannot be deleted through this route");
  }

  // Prevent self-deletion
  if (id === req.user._id.toString()) {
    res.status(403);
    throw new Error("Admins cannot delete their own account");
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully"
  });
});

/**
 * @desc    Get basic system statistics (Admin only)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const regularUsers = await User.countDocuments({ role: "user" });

  res.status(200).json({
    success: true,
    totalUsers,
    regularUsers
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getOwnProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    success: true,
    user
  });
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateOwnProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Security check: Role should not be updated via this route
  if (Object.prototype.hasOwnProperty.call(req.body, "role")) {
    res.status(403);
    throw new Error("You are not allowed to update role");
  }

  // Update fields if provided
  if (name) user.name = name;
  
  if (email && email.toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      res.status(409);
      throw new Error("Email is already in use by another account");
    }
    user.email = email.toLowerCase();
  }

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

module.exports = {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getSystemStats,
  getOwnProfile,
  updateOwnProfile
};
