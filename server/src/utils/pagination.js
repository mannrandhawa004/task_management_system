/**
 * Extract and sanitize pagination parameters from an Express query object.
 *
 * @param {object} query - req.query (expects optional `page` and `limit` fields)
 * @returns {{ page: number, limit: number, offset: number }}
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Wrap a data array with pagination metadata for a consistent API response shape.
 *
 * @param {{ data: Array, total: number, page: number, limit: number }} options
 * @returns {{ data: Array, pagination: object }}
 */
export const formatPagination = ({ data, total, page, limit }) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      perPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
