/**
 * @file middleware/roleMiddleware.js
 * @description Middleware to restrict access to specific roles (e.g., Admin).
 */

/**
 * @function authorizeAdmin
 * @description Checks if the authenticated user has an 'admin' role.
 * Requires the 'protect' middleware to have been executed first.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} 403 - If user is not an admin.
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied: admin only");
  }

  next();
};

module.exports = { authorizeAdmin };
