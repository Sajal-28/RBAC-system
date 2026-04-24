/**
 * @file middleware/errorMiddleware.js
 * @description Middleware for handling 404 errors and global application errors.
 */

/**
 * @function notFound
 * @description Middleware to catch requests for routes that do not exist.
 * Sets status to 404 and passes an error to the global handler.
 */
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

/**
 * @function errorHandler
 * @description Global error handling middleware.
 * Formats error responses and optionally includes stack traces in development.
 */
const errorHandler = (err, req, res, next) => {
  // Use existing status code if set, otherwise default to 500 (Internal Server Error)
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Only show stack trace in development mode for easier debugging
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
