import crypto from "crypto";

import { tenantManager } from "./TenantConnectionManager.js";
import {
  BadRequestError,
  UnauthorizedError,
} from "../../server/src/utils/errorHandler.js";

const DEFAULT_TTL_MINUTES = 10;
const MIN_TOKEN_LENGTH = 32;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token, "utf8").digest("hex");

const getTtlMinutes = () => {
  const configured = Number(process.env.ONBOARDING_HANDOFF_TTL_MINUTES || DEFAULT_TTL_MINUTES);
  return Number.isFinite(configured) && configured >= 1 && configured <= 30
    ? configured
    : DEFAULT_TTL_MINUTES;
};

class OnboardingHandoffService {
  constructor() {
    this.schemaPromise = null;
  }

  async ensureSchema() {
    if (!this.schemaPromise) {
      this.schemaPromise = tenantManager.getPlatformPool().execute(`
        CREATE TABLE IF NOT EXISTS onboarding_handoffs (
          id char(36) NOT NULL,
          checkout_id char(36) NOT NULL,
          token_hash char(64) NOT NULL,
          tenant_id int(11) NOT NULL,
          user_id int(11) NOT NULL,
          expires_at datetime NOT NULL,
          consumed_at datetime DEFAULT NULL,
          created_at timestamp NULL DEFAULT current_timestamp(),
          PRIMARY KEY (id),
          UNIQUE KEY uq_onboarding_handoff_token (token_hash),
          INDEX idx_onboarding_handoff_checkout (checkout_id),
          INDEX idx_onboarding_handoff_expiry (expires_at),
          CONSTRAINT fk_onboarding_handoff_tenant
            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `).catch((error) => {
        this.schemaPromise = null;
        throw error;
      });
    }
    return this.schemaPromise;
  }

  async issue({ checkoutId, tenantId, userId }) {
    if (!checkoutId || !tenantId || !userId) {
      throw new BadRequestError("A provisioned checkout, tenant, and administrator are required.");
    }

    await this.ensureSchema();
    const token = crypto.randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + getTtlMinutes() * 60 * 1000);
    const pool = tenantManager.getPlatformPool();

    await pool.execute(
      `DELETE FROM onboarding_handoffs
       WHERE checkout_id = ? AND consumed_at IS NULL`,
      [checkoutId],
    );
    await pool.execute(
      `INSERT INTO onboarding_handoffs
       (id, checkout_id, token_hash, tenant_id, user_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), checkoutId, tokenHash, tenantId, userId, expiresAt],
    );

    const appUrl = String(process.env.CLIENT_APP_URL || "http://localhost:3000").replace(/\/$/, "");
    return {
      onboardingUrl: `${appUrl}/auth/handoff#token=${encodeURIComponent(token)}`,
      onboardingExpiresAt: expiresAt.toISOString(),
    };
  }

  async consume(token, consumer) {
    const rawToken = String(token || "").trim();
    if (rawToken.length < MIN_TOKEN_LENGTH || typeof consumer !== "function") {
      throw new BadRequestError("A valid onboarding token is required.");
    }

    await this.ensureSchema();
    const connection = await tenantManager.getPlatformPool().getConnection();

    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute(
        `SELECT h.id, h.checkout_id, h.tenant_id, h.user_id, h.expires_at,
                h.consumed_at, t.slug AS tenant_slug, t.db_name AS tenant_db_name,
                t.status AS tenant_status
         FROM onboarding_handoffs h
         JOIN tenants t ON t.id = h.tenant_id
         WHERE h.token_hash = ?
         LIMIT 1
         FOR UPDATE`,
        [hashToken(rawToken)],
      );

      const handoff = rows[0];
      if (!handoff || handoff.consumed_at) {
        throw new UnauthorizedError("This onboarding link is invalid or has already been used.");
      }
      if (new Date(handoff.expires_at).getTime() <= Date.now()) {
        throw new UnauthorizedError("This onboarding link has expired. Sign in with your workspace credentials.");
      }
      if (!["active", "trial"].includes(handoff.tenant_status)) {
        throw new UnauthorizedError("This workspace is not active.");
      }

      const result = await consumer(handoff);
      await connection.execute(
        `UPDATE onboarding_handoffs SET consumed_at = NOW()
         WHERE id = ? AND consumed_at IS NULL`,
        [handoff.id],
      );
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback().catch(() => {});
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const onboardingHandoffService = new OnboardingHandoffService();
export default onboardingHandoffService;
