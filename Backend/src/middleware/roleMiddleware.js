/**
 * @file middleware/roleMiddleware.js
 * @description Flexible role-based access control middleware.
 * Exports authorizeRoles(...roles) — a factory that returns a middleware
 * which grants access only if the authenticated user holds one of the specified roles.
 *
 * Usage:
 *   authorizeRoles("super-admin")               — super-admin only
 *   authorizeRoles("super-admin", "admin")       — both admin-tier roles
 */

/**
 * @function authorizeRoles
 * @description Returns an Express middleware that checks if req.user.role
 * is included in the provided allowed roles list.
 * Requires the `protect` middleware to have run first (so req.user is populated).
 *
 * @param {...string} roles - One or more role strings that are permitted.
 * @returns {Function} Express middleware function
 * @throws {Error} 403 - If the user's role is not in the allowed list.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Access denied: requires one of [${roles.join(", ")}] role`
      );
    }
    next();
  };
};

module.exports = { authorizeRoles };
