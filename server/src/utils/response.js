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





/**
 * Send a standardized paginated JSON response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {Array} rows - The paginated rows
 * @param {{ page: number, limit: number, total: number }} meta
 * @param {number} [statusCode=200]
 */
export const paginatedResponse = (res, message, rows, meta, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: rows,
    meta: {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
};
