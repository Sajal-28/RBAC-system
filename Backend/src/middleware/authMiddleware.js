/**
 * @file middleware/authMiddleware.js
 * @description Middleware to protect routes by verifying JSON Web Tokens (JWT) stored in cookies.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("./asyncHandler");

/**
 * @function protect
 * @description Verifies the JWT token from the request cookies. If valid, attaches the user object to the request.
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} 401 - If token is missing, invalid, or user not found.
 */
const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token and exclude password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    if (error.name === "TokenExpiredError") {
      throw new Error("Not authorized, token expired");
    }
    throw new Error("Not authorized, token invalid");
  }
});

module.exports = { protect };
