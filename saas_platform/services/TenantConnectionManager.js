import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(path.join(__dirname, "../../server/package.json"));
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../server/.env"), quiet: true });

class TenantConnectionManager {
  constructor() {
    // Map storing active tenant pools: dbName => { pool, lastAccessed }
    this.pools = new Map();
    this.platformPool = null;

    // LRU idle eviction timer: checks every 10 minutes for inactive tenant pools (>30 mins idle)
    this.cleanupInterval = setInterval(() => this.cleanupIdlePools(), 10 * 60 * 1000);
  }

  /**
   * Get connection pool for the central SaaS platform control plane database (`saas_platform_db`).
   */
  getPlatformPool() {
    if (!this.platformPool) {
      this.platformPool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: "saas_platform_db",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return this.platformPool;
  }

  /**
   * Get or create a dedicated connection pool for a specific tenant database.
   * Reuses existing connection pools to optimize memory and connections.
   *
   * @param {string} dbName - Tenant database name (e.g., saas_tenant_acme)
   * @param {string} [dbHost] - Host address of tenant DB
   * @param {string} [dbUser] - DB User
   * @param {string} [dbPassword] - DB Password
   * @returns {Promise<import('mysql2/promise').Pool>} MySQL Pool instance
   */
  async getTenantPool(dbName, dbHost = null, dbUser = null, dbPassword = null) {
    if (!dbName) {
      throw new Error("Tenant database name is required to acquire connection pool.");
    }

    if (this.pools.has(dbName)) {
      const entry = this.pools.get(dbName);
      entry.lastAccessed = Date.now();
      return entry.pool;
    }

    const host = dbHost || process.env.DB_HOST || "localhost";
    const user = dbUser || process.env.DB_USER || "root";
    const password = dbPassword !== null ? dbPassword : (process.env.DB_PASSWORD || "");

    console.log(`[TenantConnectionManager] Initializing new connection pool for tenant DB: ${dbName}`);
    
    const newPool = mysql.createPool({
      host,
      user,
      password,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 5, // Scalable per-tenant connection limit
      queueLimit: 0,
    });

    // Test connection to ensure database exists and is accessible
    try {
      const conn = await newPool.getConnection();
      conn.release();
    } catch (error) {
      console.error(`[TenantConnectionManager] Failed to connect to tenant DB ${dbName}: ${error.message}`);
      throw error;
    }

    this.pools.set(dbName, {
      pool: newPool,
      lastAccessed: Date.now(),
    });

    return newPool;
  }

  /**
   * Look up tenant credentials from `saas_platform_db.tenants` by slug and return its pool.
   *
   * @param {string} slug - Unique tenant slug (e.g., 'acme-corp')
   * @returns {Promise<{ tenant: object, pool: import('mysql2/promise').Pool }>}
   */
  async getPoolBySlug(slug) {
    const platform = this.getPlatformPool();
    const [rows] = await platform.execute(
      `SELECT * FROM tenants WHERE slug = ? AND status IN ('active', 'trial') LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      throw new Error(`Tenant with slug '${slug}' not found or inactive.`);
    }

    const tenant = rows[0];
    const pool = await this.getTenantPool(
      tenant.db_name,
      tenant.db_host,
      tenant.db_user,
      tenant.db_password
    );

    return { tenant, pool };
  }

  /**
   * Look up tenant credentials from `saas_platform_db.tenants` by db_name and return its pool.
   */
  async getPoolByDbName(dbName) {
    const platform = this.getPlatformPool();
    const [rows] = await platform.execute(
      `SELECT * FROM tenants WHERE db_name = ? LIMIT 1`,
      [dbName]
    );

    if (rows.length === 0) {
      throw new Error(`Tenant with database '${dbName}' not found in control plane.`);
    }

    const tenant = rows[0];
    const pool = await this.getTenantPool(
      tenant.db_name,
      tenant.db_host,
      tenant.db_user,
      tenant.db_password
    );

    return { tenant, pool };
  }

  /**
   * Automatically close and evict tenant pools that have been idle for more than 30 minutes.
   */
  async cleanupIdlePools() {
    const now = Date.now();
    const idleThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [dbName, entry] of this.pools.entries()) {
      if (now - entry.lastAccessed > idleThreshold) {
        console.log(`[TenantConnectionManager] Closing idle connection pool for tenant: ${dbName}`);
        try {
          await entry.pool.end();
        } catch (e) {
          console.error(`[TenantConnectionManager] Error closing pool ${dbName}:`, e.message);
        }
        this.pools.delete(dbName);
      }
    }
  }

  /**
   * Gracefully close all connection pools during shutdown.
   */
  async closeAll() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    for (const [dbName, entry] of this.pools.entries()) {
      await entry.pool.end();
    }
    this.pools.clear();
    if (this.platformPool) {
      await this.platformPool.end();
      this.platformPool = null;
    }
  }
}

export const tenantManager = new TenantConnectionManager();
export default tenantManager;
