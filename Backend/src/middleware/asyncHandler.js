/**
 * @file middleware/asyncHandler.js
 * @description Wrapper function to handle asynchronous errors in Express routes.
 * Eliminates the need for repetitive try-catch blocks.
 */

/**
 * @function asyncHandler
 * @description Wraps an asynchronous middleware/controller function and passes any caught errors to the next error-handling middleware.
 * @param {Function} handler - The async function to wrap.
 * @returns {Function} - A function that executes the handler and catches potential errors.
 */
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = asyncHandler;
