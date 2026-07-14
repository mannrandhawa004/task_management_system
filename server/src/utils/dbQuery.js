import { pool as defaultPool } from "../config/db.js";
import { getTenantPool } from "../../../saas_platform/context/tenantContext.js";

/**
 * Execute a parameterized SQL query against the active MySQL connection pool.
 * Transparently checks Node.js AsyncLocalStorage for a tenant connection pool.
 * If a tenant execution context is active, executes against the tenant's isolated database.
 * Otherwise, falls back to the default/platform connection pool.
 *
 * @param {string} query - SQL query string with `?` placeholders
 * @param {Array} [params=[]] - Values to substitute for placeholders
 * @param {import('mysql2/promise').Pool|import('mysql2/promise').Connection|null} [customConnection=null] - Optional explicit pool or connection (e.g. inside transactions)
 * @returns {Promise<any>} Query result rows (or result object for INSERT/UPDATE/DELETE)
 */
export const executeQuery = async (query, params = [], customConnection = null) => {
  const activeExecutor = customConnection || getTenantPool() || defaultPool;
  const safeParams = (params || []).map((p) => (p === undefined ? null : p));
  const [rows] = await activeExecutor.execute(query, safeParams);
  return rows;
};
