/**
 * Wraps an async Express route/controller function and forwards any
 * rejected promise (thrown error) to Express's next() error handler,
 * eliminating the need for try/catch in every controller.
 *
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
