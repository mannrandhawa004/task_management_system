/**
 * Send a standardized success JSON response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Human-readable success message
 * @param {*} [data=null] - Payload to include in the response
 * @param {number} [statusCode=200] - HTTP status code
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
