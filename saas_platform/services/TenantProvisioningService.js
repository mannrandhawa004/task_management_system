import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { tenantManager } from "./TenantConnectionManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(path.join(__dirname, "../../server/package.json"));
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../server/.env"), quiet: true });

class TenantProvisioningService {
  /**
   * Provision a complete new tenant:
   * 1. Check uniqueness of slug/email in saas_platform_db
   * 2. Create isolated MySQL database `tenant_<slug>`
   * 3. Execute all 21 tables baseline schema (tenant_base_schema.sql)
   * 4. Provision dedicated Super Admin (`role_id = 1`) inside the tenant database
   * 5. Record tenant & subscription metadata in `saas_platform_db`
   *
   * @param {object} params
   * @param {string} params.companyName
   * @param {string} params.slug
   * @param {string} params.contactName
   * @param {string} params.contactEmail
   * @param {string} [params.contactPhone]
   * @param {number} [params.planId=1]
   * @param {string} [params.billingCycle='monthly']
   * @param {string} params.adminPassword
   * @returns {Promise<object>} Provisioned tenant & credentials
   */
  async provisionTenant({
    companyName,
    slug,
    contactName,
    contactEmail,
    contactPhone = "",
    planId = 1,
    billingCycle = "monthly",
    adminPassword = null,
    adminPasswordHash = null,
    paymentMethod = "stripe",
    transactionReference = null,
    amountPaid = null,
    paymentCurrency = "USD",
  }) {
    if (!companyName || !slug || !contactEmail || (!adminPassword && !adminPasswordHash)) {
      throw new Error("Company name, slug, contact email, and administrator credentials are required.");
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");
    const dbName = `tenant_${cleanSlug.replace(/-/g, "_")}`;

    const platformPool = tenantManager.getPlatformPool();

    // 1. Validate uniqueness
    const [existing] = await platformPool.execute(
      `SELECT id FROM tenants WHERE slug = ? OR db_name = ? OR contact_email = ? LIMIT 1`,
      [cleanSlug, dbName, contactEmail]
    );

    if (existing.length > 0) {
      throw new Error(
        `A company with slug '${cleanSlug}', database '${dbName}', or email '${contactEmail}' already exists.`
      );
    }

    // 2. Create isolated MySQL database
    console.log(`[Provisioning] Creating dedicated database: ${dbName}`);
    const rootConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    try {
      await rootConn.query(
        `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await rootConn.query(`USE \`${dbName}\`;`);

      // 3. Execute 21-table schema (`tenant_base_schema.sql`)
      console.log(`[Provisioning] Running 21-table schema inside ${dbName}...`);
      const schemaPath = path.join(__dirname, "../database/tenant_base_schema.sql");
      const schemaSql = fs.readFileSync(schemaPath, "utf8");
      await rootConn.query(schemaSql);

      // 4. Provision dedicated Super Admin (`role_id = 1`) inside the tenant database
      console.log(`[Provisioning] Creating Super Admin account inside ${dbName}...`);
      const hashedPassword = adminPasswordHash || await bcrypt.hash(adminPassword, 12);

      await rootConn.execute(
        `INSERT INTO users (name, first_name, last_name, email, password, role_id, status, employee_id, two_factor_enabled) 
         VALUES (?, ?, ?, ?, ?, 1, 'active', 'EMP-0001', 0)`,
        [
          contactName,
          contactName.split(" ")[0] || "Super",
          contactName.split(" ").slice(1).join(" ") || "Admin",
          contactEmail,
          hashedPassword,
        ]
      );

    } catch (dbError) {
      console.error(`[Provisioning] Database creation failed for ${dbName}:`, dbError.message);
      await rootConn.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`).catch(() => {});
      await rootConn.end();
      throw dbError;
    }

    // 5. Record tenant and subscription atomically in the control plane. If
    // this transaction fails, remove the tenant database so a paid checkout
    // can be safely retried instead of leaving a half-provisioned account.
    console.log(`[Provisioning] Recording tenant and subscription in saas_platform_db...`);
    let platformConnection;
    try {
      platformConnection = await platformPool.getConnection();
    } catch (connectionError) {
      await rootConn.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`).catch(() => {});
      await rootConn.end().catch(() => {});
      throw connectionError;
    }
    let tenantId;
    let planName;
    let recordedAmount;
    try {
      await platformConnection.beginTransaction();

      const [planRows] = await platformConnection.execute(
        `SELECT name, price_monthly, price_yearly
         FROM subscription_plans
         WHERE id = ? AND is_active = true
         LIMIT 1
         FOR UPDATE`,
        [planId],
      );
      if (planRows.length === 0) {
        throw new Error("The selected subscription plan is no longer available.");
      }
      planName = planRows[0].name;

      const [tenantRes] = await platformConnection.execute(
        `INSERT INTO tenants
         (company_name, slug, contact_name, contact_email, contact_phone, db_name, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [companyName, cleanSlug, contactName, contactEmail, contactPhone, dbName],
      );
      tenantId = tenantRes.insertId;

      const startDate = new Date();
      const endDate = new Date(startDate);
      if (billingCycle === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      recordedAmount = amountPaid ?? (
        billingCycle === "yearly"
          ? planRows[0].price_yearly
          : planRows[0].price_monthly
      );

      await platformConnection.execute(
        `INSERT INTO tenant_subscriptions
         (tenant_id, plan_id, billing_cycle, status, start_date, end_date,
          amount_paid, currency, payment_method, transaction_reference)
         VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
        [
          tenantId,
          planId,
          billingCycle,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
          recordedAmount,
          paymentCurrency,
          paymentMethod,
          transactionReference,
        ],
      );

      await platformConnection.commit();
    } catch (platformError) {
      await platformConnection.rollback().catch(() => {});
      await rootConn.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`).catch(() => {});
      throw platformError;
    } finally {
      platformConnection.release();
      await rootConn.end().catch(() => {});
    }

    console.log(`[Provisioning] 🎉 Tenant '${companyName}' (${cleanSlug}) provisioned successfully!`);

    return {
      success: true,
      tenant: {
        id: tenantId,
        companyName,
        slug: cleanSlug,
        dbName,
        contactName,
        contactEmail,
      },
      superAdmin: {
        email: contactEmail,
        role: "super_admin",
        loginUrl: process.env.CLIENT_APP_URL || "http://localhost:3000",
      },
      subscription: {
        planId,
        planName,
        billingCycle,
        amountPaid: recordedAmount,
        currency: paymentCurrency,
        gateway: paymentMethod,
        transactionReference,
      },
    };
  }

  /**
   * Delete / Deprovision a tenant database and clean up records (for admin/testing).
   */
  async deprovisionTenant(slug) {
    const platformPool = tenantManager.getPlatformPool();
    const [rows] = await platformPool.execute(`SELECT * FROM tenants WHERE slug = ? LIMIT 1`, [slug]);
    if (rows.length === 0) {
      throw new Error(`Tenant with slug '${slug}' not found.`);
    }
    const tenant = rows[0];

    // Close tenant pool if active
    if (tenantManager.pools.has(tenant.db_name)) {
      const entry = tenantManager.pools.get(tenant.db_name);
      await entry.pool.end().catch(() => {});
      tenantManager.pools.delete(tenant.db_name);
    }

    const rootConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    await rootConn.query(`DROP DATABASE IF EXISTS \`${tenant.db_name}\`;`);
    await rootConn.end();

    await platformPool.execute(`DELETE FROM tenants WHERE id = ?`, [tenant.id]);
    console.log(`[Provisioning] Deprovisioned tenant: ${slug} (${tenant.db_name})`);
    return { success: true, message: `Tenant ${slug} deprovisioned.` };
  }
}

export const provisioningService = new TenantProvisioningService();
export default provisioningService;
