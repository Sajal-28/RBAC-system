/**
 * @file utils/generateToken.js
 * @description Utility function to generate a JSON Web Token (JWT) and set it as an HTTP-only cookie.
 */

const jwt = require("jsonwebtoken");

/**
 * @function generateToken
 * @description Signs a JWT with the user's ID and role, and attaches it to the response as a secure cookie.
 * @param {Object} res - Express response object.
 * @param {Object} user - User object containing _id and role.
 */
const generateToken = (res, user) => {
  // Sign the token with user information
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d" // Token expires in 7 days
    }
  );

  // Set the token in an HTTP-only cookie for security
  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // Cookie lifespan (7 days in milliseconds)
  });
};

module.exports = generateToken;
