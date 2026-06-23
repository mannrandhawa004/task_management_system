import { pool } from "../config/db.js";

/**
 * Execute a parameterized SQL query against the MySQL connection pool.
 *
 * @param {string} query - SQL query string with `?` placeholders
 * @param {Array} [params=[]] - Values to substitute for placeholders
 * @returns {Promise<any>} Query result rows (or result object for INSERT/UPDATE/DELETE)
 */
export const executeQuery = async (query, params = []) => {
  const [rows] = await pool.execute(query, params);
  return rows;
};
