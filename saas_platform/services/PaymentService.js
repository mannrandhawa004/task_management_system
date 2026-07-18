import crypto from "crypto";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

import { tenantManager } from "./TenantConnectionManager.js";
import { provisioningService } from "./TenantProvisioningService.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from "../../server/src/utils/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(path.join(__dirname, "../../server/package.json"));
const bcrypt = require("bcrypt");
const Stripe = require("stripe");
const Razorpay = require("razorpay");

const ALLOWED_GATEWAYS = new Set(["stripe", "razorpay"]);
const ALLOWED_BILLING_CYCLES = new Set(["monthly", "yearly"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECKOUT_TTL_MINUTES = 60;

const cleanText = (value) => String(value || "").trim();

export const normalizeWorkspaceSlug = (value) =>
  cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const validateCheckoutPayload = (payload = {}) => {
  const companyName = cleanText(payload.companyName);
  const slug = normalizeWorkspaceSlug(payload.slug);
  const contactName = cleanText(payload.contactName);
  const contactEmail = cleanText(payload.contactEmail).toLowerCase();
  const contactPhone = cleanText(payload.contactPhone);
  const adminPassword = String(payload.adminPassword || "");
  const gateway = cleanText(payload.gateway).toLowerCase();
  const billingCycle = cleanText(payload.billingCycle || "monthly").toLowerCase();
  const planId = Number(payload.planId);

  if (companyName.length < 2 || companyName.length > 120) {
    throw new BadRequestError("Organization name must be between 2 and 120 characters.");
  }
  if (slug.length < 3 || slug.length > 50) {
    throw new BadRequestError("Workspace URL must be between 3 and 50 characters.");
  }
  if (contactName.length < 2 || contactName.length > 120) {
    throw new BadRequestError("Administrator name must be between 2 and 120 characters.");
  }
  if (!EMAIL_PATTERN.test(contactEmail) || contactEmail.length > 254) {
    throw new BadRequestError("Enter a valid administrator email address.");
  }
  if (adminPassword.length < 8 || adminPassword.length > 128) {
    throw new BadRequestError("Password must be between 8 and 128 characters.");
  }
  if (!Number.isInteger(planId) || planId < 1) {
    throw new BadRequestError("Select a valid subscription plan.");
  }
  if (!ALLOWED_BILLING_CYCLES.has(billingCycle)) {
    throw new BadRequestError("Billing cycle must be monthly or yearly.");
  }
  if (!ALLOWED_GATEWAYS.has(gateway)) {
    throw new BadRequestError("Payment gateway must be Stripe or Razorpay.");
  }

  return {
    companyName,
    slug,
    contactName,
    contactEmail,
    contactPhone,
    adminPassword,
    gateway,
    billingCycle,
    planId,
  };
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature, secret }) => {
  if (!orderId || !paymentId || !signature || !secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(String(signature), "utf8");

  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  );
};

export const verifyWebhookSignature = ({ rawBody, signature, secret }) => {
  if (!rawBody || !signature || !secret) return false;
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(String(signature), "utf8");
  return (
    expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer)
  );
};

class PaymentService {
  constructor() {
    this.schemaPromise = null;
    this.stripeClient = null;
    this.razorpayClient = null;
  }

  getStripeClient() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new ServiceUnavailableError(
        "Stripe checkout is not configured. Add STRIPE_SECRET_KEY to server/.env.",
      );
    }
    if (!this.stripeClient) {
      this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return this.stripeClient;
  }

  getRazorpayClient() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new ServiceUnavailableError(
        "Razorpay checkout is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server/.env.",
      );
    }
    if (!this.razorpayClient) {
      this.razorpayClient = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
    return this.razorpayClient;
  }

  async ensureSchema() {
    if (!this.schemaPromise) {
      this.schemaPromise = this.createSchema().catch((error) => {
        this.schemaPromise = null;
        throw error;
      });
    }
    return this.schemaPromise;
  }

  async createSchema() {
    const pool = tenantManager.getPlatformPool();
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS signup_checkouts (
        id char(36) NOT NULL,
        gateway enum('stripe','razorpay') NOT NULL,
        gateway_session_id varchar(255) DEFAULT NULL,
        gateway_payment_id varchar(255) DEFAULT NULL,
        plan_id int(11) NOT NULL,
        billing_cycle enum('monthly','yearly') NOT NULL,
        amount_minor bigint unsigned NOT NULL,
        currency char(3) NOT NULL,
        company_name varchar(120) NOT NULL,
        workspace_slug varchar(50) NOT NULL,
        contact_name varchar(120) NOT NULL,
        contact_email varchar(254) NOT NULL,
        contact_phone varchar(50) DEFAULT NULL,
        password_hash varchar(255) NOT NULL,
        status enum('pending','paid','provisioning','provisioned','failed','expired') NOT NULL DEFAULT 'pending',
        tenant_id int(11) DEFAULT NULL,
        failure_reason varchar(500) DEFAULT NULL,
        expires_at datetime NOT NULL,
        created_at timestamp NULL DEFAULT current_timestamp(),
        updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY uq_signup_gateway_session (gateway_session_id),
        INDEX idx_signup_checkout_status (status),
        INDEX idx_signup_checkout_slug (workspace_slug),
        INDEX idx_signup_checkout_email (contact_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [currencyColumns] = await pool.execute(
      "SHOW COLUMNS FROM tenant_subscriptions LIKE 'currency'",
    );
    if (currencyColumns.length === 0) {
      await pool.execute(
        "ALTER TABLE tenant_subscriptions ADD COLUMN currency char(3) NOT NULL DEFAULT 'USD' AFTER amount_paid",
      );
    }
  }

  async getPlan(planId) {
    const pool = tenantManager.getPlatformPool();
    const [rows] = await pool.execute(
      `SELECT id, name, slug, description, price_monthly, price_yearly
       FROM subscription_plans
       WHERE id = ? AND is_active = true
       LIMIT 1`,
      [planId],
    );

    if (rows.length === 0) {
      throw new NotFoundError("The selected subscription plan is unavailable.");
    }
    return rows[0];
  }

  calculateCharge(plan, billingCycle, gateway) {
    const amountMajor = Number(
      billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly,
    );
    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      throw new BadRequestError("The selected plan does not have a payable price.");
    }

    if (gateway === "stripe") {
      return { amountMinor: Math.round(amountMajor * 100), currency: "USD" };
    }

    const usdToInr = Number(process.env.RAZORPAY_USD_TO_INR || 83);
    if (!Number.isFinite(usdToInr) || usdToInr <= 0) {
      throw new ServiceUnavailableError("RAZORPAY_USD_TO_INR must be a positive number.");
    }
    return { amountMinor: Math.round(amountMajor * usdToInr * 100), currency: "INR" };
  }

  async assertWorkspaceAvailable(slug, email) {
    const pool = tenantManager.getPlatformPool();
    const [rows] = await pool.execute(
      `SELECT id FROM tenants WHERE slug = ? OR contact_email = ? LIMIT 1`,
      [slug, email],
    );
    if (rows.length > 0) {
      throw new ConflictError("That workspace URL or administrator email is already registered.");
    }

    const [activeCheckouts] = await pool.execute(
      `SELECT id FROM signup_checkouts
       WHERE status = 'pending'
         AND expires_at > NOW()
         AND (workspace_slug = ? OR contact_email = ?)
       LIMIT 1`,
      [slug, email],
    );
    if (activeCheckouts.length > 0) {
      throw new ConflictError(
        "An active checkout already exists for this workspace or email. Finish or cancel it before starting another.",
      );
    }
  }

  async createCheckout(rawPayload) {
    await this.ensureSchema();
    const payload = validateCheckoutPayload(rawPayload);
    const plan = await this.getPlan(payload.planId);
    const { amountMinor, currency } = this.calculateCharge(
      plan,
      payload.billingCycle,
      payload.gateway,
    );
    await this.assertWorkspaceAvailable(payload.slug, payload.contactEmail);

    const checkoutId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(payload.adminPassword, 12);
    const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MINUTES * 60 * 1000);
    const pool = tenantManager.getPlatformPool();

    await pool.execute(
      `INSERT INTO signup_checkouts
       (id, gateway, plan_id, billing_cycle, amount_minor, currency, company_name,
        workspace_slug, contact_name, contact_email, contact_phone, password_hash, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        checkoutId,
        payload.gateway,
        payload.planId,
        payload.billingCycle,
        amountMinor,
        currency,
        payload.companyName,
        payload.slug,
        payload.contactName,
        payload.contactEmail,
        payload.contactPhone || null,
        passwordHash,
        expiresAt,
      ],
    );

    try {
      if (payload.gateway === "stripe") {
        return await this.createStripeCheckout({
          checkoutId,
          payload,
          plan,
          amountMinor,
          currency,
          expiresAt,
        });
      }
      return await this.createRazorpayCheckout({
        checkoutId,
        payload,
        plan,
        amountMinor,
        currency,
      });
    } catch (error) {
      await pool.execute(
        `UPDATE signup_checkouts SET status = 'failed', failure_reason = ? WHERE id = ?`,
        [cleanText(error.message).slice(0, 500), checkoutId],
      );
      throw error;
    }
  }

  async createStripeCheckout({ checkoutId, payload, plan, amountMinor, currency, expiresAt }) {
    const stripe = this.getStripeClient();
    const landingUrl = cleanText(process.env.SAAS_LANDING_URL || "http://localhost:5173").replace(/\/$/, "");
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: checkoutId,
        customer_email: payload.contactEmail,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: currency.toLowerCase(),
              unit_amount: amountMinor,
              product_data: {
                name: `TaskFlow ${plan.name}`,
                description: `${payload.billingCycle === "yearly" ? "Annual" : "Monthly"} workspace subscription`,
              },
            },
          },
        ],
        metadata: {
          checkout_id: checkoutId,
          plan_id: String(plan.id),
          workspace_slug: payload.slug,
        },
        success_url: `${landingUrl}/signup?payment=success&gateway=stripe&checkout_id=${encodeURIComponent(checkoutId)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${landingUrl}/signup?payment=cancelled&checkout_id=${encodeURIComponent(checkoutId)}`,
      },
      { idempotencyKey: checkoutId },
    );

    await tenantManager.getPlatformPool().execute(
      `UPDATE signup_checkouts SET gateway_session_id = ? WHERE id = ?`,
      [session.id, checkoutId],
    );

    return {
      checkoutId,
      gateway: "stripe",
      redirectUrl: session.url,
      amount: amountMinor,
      currency,
      plan: this.publicPlan(plan, payload.billingCycle),
    };
  }

  async createRazorpayCheckout({ checkoutId, payload, plan, amountMinor, currency }) {
    const razorpay = this.getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: amountMinor,
      currency,
      receipt: `tf_${checkoutId.replace(/-/g, "").slice(0, 32)}`,
      notes: {
        checkout_id: checkoutId,
        workspace_slug: payload.slug,
        plan_id: String(plan.id),
      },
    });

    await tenantManager.getPlatformPool().execute(
      `UPDATE signup_checkouts SET gateway_session_id = ? WHERE id = ?`,
      [order.id, checkoutId],
    );

    return {
      checkoutId,
      gateway: "razorpay",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      businessName: "TaskFlow",
      description: `${plan.name} ${payload.billingCycle} subscription`,
      prefill: {
        name: payload.contactName,
        email: payload.contactEmail,
        contact: payload.contactPhone,
      },
      plan: this.publicPlan(plan, payload.billingCycle),
    };
  }

  publicPlan(plan, billingCycle) {
    return {
      id: plan.id,
      name: plan.name,
      billingCycle,
    };
  }

  async getCheckout(checkoutId, expectedGateway = null, allowExpired = false) {
    await this.ensureSchema();
    const [rows] = await tenantManager.getPlatformPool().execute(
      `SELECT * FROM signup_checkouts WHERE id = ? LIMIT 1`,
      [checkoutId],
    );
    if (rows.length === 0) throw new NotFoundError("Checkout session was not found.");

    const checkout = rows[0];
    if (expectedGateway && checkout.gateway !== expectedGateway) {
      throw new BadRequestError("Checkout gateway does not match this verification endpoint.");
    }
    const isUnpaidAndExpired =
      ["pending", "failed", "expired"].includes(checkout.status) &&
      new Date(checkout.expires_at).getTime() < Date.now();
    if (!allowExpired && (checkout.status === "expired" || isUnpaidAndExpired)) {
      throw new BadRequestError("This checkout session has expired. Start a new checkout.");
    }
    return checkout;
  }

  async verifyStripeCheckout({ checkoutId, sessionId }) {
    if (!checkoutId || !sessionId) {
      throw new BadRequestError("Checkout ID and Stripe session ID are required.");
    }
    const checkout = await this.getCheckout(checkoutId, "stripe", true);
    if (checkout.status === "provisioned") return this.getProvisionedResult(checkout);
    if (checkout.gateway_session_id !== sessionId) {
      throw new BadRequestError("Stripe session does not belong to this signup checkout.");
    }

    const session = await this.getStripeClient().checkout.sessions.retrieve(sessionId);
    const currency = cleanText(session.currency).toUpperCase();
    if (
      session.client_reference_id !== checkout.id ||
      session.payment_status !== "paid" ||
      Number(session.amount_total) !== Number(checkout.amount_minor) ||
      currency !== checkout.currency
    ) {
      throw new BadRequestError("Stripe has not confirmed the expected payment for this checkout.");
    }

    const transactionReference =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || session.id;
    return this.finalizePaidCheckout(checkout, transactionReference);
  }

  async verifyRazorpayCheckout({
    checkoutId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) {
    if (!checkoutId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new BadRequestError("Complete Razorpay payment verification details are required.");
    }
    const checkout = await this.getCheckout(checkoutId, "razorpay", true);
    if (checkout.status === "provisioned") return this.getProvisionedResult(checkout);
    if (checkout.gateway_session_id !== razorpayOrderId) {
      throw new BadRequestError("Razorpay order does not belong to this signup checkout.");
    }
    if (
      !verifyRazorpaySignature({
        orderId: checkout.gateway_session_id,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        secret: process.env.RAZORPAY_KEY_SECRET,
      })
    ) {
      throw new BadRequestError("Razorpay payment signature verification failed.");
    }

    const razorpay = this.getRazorpayClient();
    let payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment.order_id !== checkout.gateway_session_id) {
      throw new BadRequestError("Razorpay payment is linked to a different order.");
    }
    if (payment.status === "authorized") {
      payment = await razorpay.payments.capture(
        razorpayPaymentId,
        Number(checkout.amount_minor),
        checkout.currency,
      );
    }
    if (
      payment.status !== "captured" ||
      Number(payment.amount) !== Number(checkout.amount_minor) ||
      cleanText(payment.currency).toUpperCase() !== checkout.currency
    ) {
      throw new BadRequestError("Razorpay has not confirmed a captured payment for this checkout.");
    }

    return this.finalizePaidCheckout(checkout, razorpayPaymentId);
  }

  async getCheckoutByGatewaySession(gateway, gatewaySessionId) {
    await this.ensureSchema();
    const [rows] = await tenantManager.getPlatformPool().execute(
      `SELECT * FROM signup_checkouts
       WHERE gateway = ? AND gateway_session_id = ?
       LIMIT 1`,
      [gateway, gatewaySessionId],
    );
    if (rows.length === 0) {
      throw new NotFoundError("No signup checkout matches this gateway payment.");
    }
    return rows[0];
  }

  async handleStripeWebhook(rawBody, signature) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new ServiceUnavailableError(
        "Stripe webhook verification is not configured. Add STRIPE_WEBHOOK_SECRET to server/.env.",
      );
    }

    let event;
    try {
      event = this.getStripeClient().webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      throw new BadRequestError(`Stripe webhook signature verification failed: ${error.message}`);
    }

    if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
      return { received: true, eventType: event.type, ignored: true };
    }

    const session = event.data.object;
    if (session.payment_status !== "paid") {
      return { received: true, eventType: event.type, ignored: true };
    }
    const checkout = await this.getCheckoutByGatewaySession("stripe", session.id);
    if (checkout.status === "provisioned") return this.getProvisionedResult(checkout);
    if (
      session.client_reference_id !== checkout.id ||
      Number(session.amount_total) !== Number(checkout.amount_minor) ||
      cleanText(session.currency).toUpperCase() !== checkout.currency
    ) {
      throw new BadRequestError("Stripe webhook payment details do not match the signup checkout.");
    }

    const transactionReference =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || session.id;
    return this.finalizePaidCheckout(checkout, transactionReference);
  }

  async handleRazorpayWebhook(rawBody, signature) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      throw new ServiceUnavailableError(
        "Razorpay webhook verification is not configured. Add RAZORPAY_WEBHOOK_SECRET to server/.env.",
      );
    }
    if (
      !verifyWebhookSignature({
        rawBody,
        signature,
        secret: process.env.RAZORPAY_WEBHOOK_SECRET,
      })
    ) {
      throw new BadRequestError("Razorpay webhook signature verification failed.");
    }

    let event;
    try {
      event = JSON.parse(Buffer.from(rawBody).toString("utf8"));
    } catch {
      throw new BadRequestError("Razorpay webhook body is not valid JSON.");
    }
    if (!["payment.captured", "order.paid"].includes(event.event)) {
      return { received: true, eventType: event.event, ignored: true };
    }

    const payment = event.payload?.payment?.entity;
    if (!payment?.id || !payment.order_id || payment.status !== "captured") {
      throw new BadRequestError("Razorpay webhook does not contain a captured order payment.");
    }
    const checkout = await this.getCheckoutByGatewaySession("razorpay", payment.order_id);
    if (checkout.status === "provisioned") return this.getProvisionedResult(checkout);
    if (
      Number(payment.amount) !== Number(checkout.amount_minor) ||
      cleanText(payment.currency).toUpperCase() !== checkout.currency
    ) {
      throw new BadRequestError("Razorpay webhook payment details do not match the signup checkout.");
    }

    return this.finalizePaidCheckout(checkout, payment.id);
  }

  async finalizePaidCheckout(checkout, transactionReference) {
    const pool = tenantManager.getPlatformPool();
    const [claim] = await pool.execute(
      `UPDATE signup_checkouts
       SET status = 'provisioning', gateway_payment_id = ?, failure_reason = NULL
       WHERE id = ? AND status IN ('pending', 'paid', 'failed', 'expired')`,
      [transactionReference, checkout.id],
    );

    if (claim.affectedRows === 0) {
      const current = await this.getCheckout(checkout.id, checkout.gateway);
      if (current.status === "provisioned") return this.getProvisionedResult(current);
      const reconciled = await this.reconcileProvisionedCheckout(current);
      if (reconciled) return reconciled;
      throw new ConflictError("Workspace provisioning is already in progress. Please try again shortly.");
    }

    try {
      const result = await provisioningService.provisionTenant({
        companyName: checkout.company_name,
        slug: checkout.workspace_slug,
        contactName: checkout.contact_name,
        contactEmail: checkout.contact_email,
        contactPhone: checkout.contact_phone || "",
        planId: checkout.plan_id,
        billingCycle: checkout.billing_cycle,
        adminPasswordHash: checkout.password_hash,
        paymentMethod: checkout.gateway,
        transactionReference,
        amountPaid: Number(checkout.amount_minor) / 100,
        paymentCurrency: checkout.currency,
      });

      await pool.execute(
        `UPDATE signup_checkouts
         SET status = 'provisioned', tenant_id = ?, password_hash = '', failure_reason = NULL
         WHERE id = ?`,
        [result.tenant.id, checkout.id],
      );

      return {
        checkoutId: checkout.id,
        gateway: checkout.gateway,
        status: "provisioned",
        ...result,
      };
    } catch (error) {
      const reconciled = await this.reconcileProvisionedCheckout(checkout);
      if (reconciled) return reconciled;
      await pool.execute(
        `UPDATE signup_checkouts SET status = 'paid', failure_reason = ? WHERE id = ?`,
        [cleanText(error.message).slice(0, 500), checkout.id],
      );
      throw error;
    }
  }

  async reconcileProvisionedCheckout(checkout) {
    const pool = tenantManager.getPlatformPool();
    const [rows] = await pool.execute(
      `SELECT id FROM tenants
       WHERE slug = ? AND contact_email = ?
       LIMIT 1`,
      [checkout.workspace_slug, checkout.contact_email],
    );
    if (rows.length === 0) return null;

    await pool.execute(
      `UPDATE signup_checkouts
       SET status = 'provisioned', tenant_id = ?, password_hash = '', failure_reason = NULL
       WHERE id = ?`,
      [rows[0].id, checkout.id],
    );
    return this.getProvisionedResult({ ...checkout, tenant_id: rows[0].id });
  }

  async getProvisionedResult(checkout) {
    const [rows] = await tenantManager.getPlatformPool().execute(
      `SELECT t.id, t.company_name, t.slug, t.db_name, t.contact_name, t.contact_email,
              s.plan_id, s.billing_cycle, s.amount_paid, s.currency, s.payment_method,
              s.transaction_reference, p.name AS plan_name
       FROM tenants t
       LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
       LEFT JOIN subscription_plans p ON p.id = s.plan_id
       WHERE t.id = ?
       LIMIT 1`,
      [checkout.tenant_id],
    );
    if (rows.length === 0) {
      throw new ConflictError("Payment is complete, but the workspace record is unavailable.");
    }
    const tenant = rows[0];
    return {
      checkoutId: checkout.id,
      gateway: checkout.gateway,
      status: "provisioned",
      success: true,
      tenant: {
        id: tenant.id,
        companyName: tenant.company_name,
        slug: tenant.slug,
        dbName: tenant.db_name,
        contactName: tenant.contact_name,
        contactEmail: tenant.contact_email,
      },
      superAdmin: {
        email: tenant.contact_email,
        role: "super_admin",
        loginUrl: process.env.CLIENT_APP_URL || "http://localhost:3000",
      },
      subscription: {
        planId: tenant.plan_id,
        planName: tenant.plan_name,
        billingCycle: tenant.billing_cycle,
        amountPaid: Number(tenant.amount_paid),
        currency: tenant.currency,
        gateway: tenant.payment_method,
        transactionReference: tenant.transaction_reference,
      },
    };
  }

  async getCheckoutStatus(checkoutId) {
    const checkout = await this.getCheckout(checkoutId, null, true);
    const response = {
      checkoutId: checkout.id,
      gateway: checkout.gateway,
      status: checkout.status,
    };
    if (checkout.status === "provisioned") {
      return this.getProvisionedResult(checkout);
    }
    return response;
  }

  async cancelCheckout(checkoutId) {
    await this.ensureSchema();
    const pool = tenantManager.getPlatformPool();
    const [rows] = await pool.execute(
      `SELECT * FROM signup_checkouts WHERE id = ? LIMIT 1`,
      [checkoutId],
    );
    if (rows.length === 0) throw new NotFoundError("Checkout session was not found.");

    const checkout = rows[0];
    if (["paid", "provisioning", "provisioned"].includes(checkout.status)) {
      throw new ConflictError("A paid or provisioning checkout cannot be cancelled.");
    }

    if (checkout.gateway === "stripe" && checkout.gateway_session_id) {
      const stripe = this.getStripeClient();
      const session = await stripe.checkout.sessions.retrieve(checkout.gateway_session_id);
      if (session.payment_status === "paid") {
        throw new ConflictError("Stripe has already confirmed payment for this checkout.");
      }
      if (session.status === "open") {
        await stripe.checkout.sessions.expire(checkout.gateway_session_id);
      }
    }

    await pool.execute(
      `UPDATE signup_checkouts SET status = 'expired' WHERE id = ?`,
      [checkoutId],
    );
    return { checkoutId, status: "expired" };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
