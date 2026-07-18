import { tenantManager } from "../services/TenantConnectionManager.js";
import { paymentService } from "../services/PaymentService.js";
import { deleteUploadedImage } from "../../server/src/middlewares/upload.middleware.js";
import { asyncHandler } from "../../server/src/utils/asyncHandler.js";
import { successResponse } from "../../server/src/utils/response.js";
import { BadRequestError, NotFoundError } from "../../server/src/utils/errorHandler.js";

class SaasController {
  /** List all active subscription plans from the platform database. */
  getPlans = asyncHandler(async (req, res) => {
    const platformPool = tenantManager.getPlatformPool();
    const [plans] = await platformPool.execute(
      "SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC",
    );

    const formattedPlans = plans.map((plan) => ({
      ...plan,
      features:
        typeof plan.features_json === "string"
          ? JSON.parse(plan.features_json)
          : plan.features_json,
    }));

    return successResponse(
      res,
      "Available subscription plans fetched successfully",
      formattedPlans,
    );
  });

  /** Verify that a workspace exists and is active before login. */
  lookupTenant = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new BadRequestError("Workspace slug is required");

    const platformPool = tenantManager.getPlatformPool();
    const [rows] = await platformPool.execute(
      `SELECT id, company_name, slug, logo_url, status
       FROM tenants
       WHERE slug = ? AND status IN ('active', 'trial')
       LIMIT 1`,
      [slug.toLowerCase().trim()],
    );

    if (rows.length === 0) {
      throw new NotFoundError(`Workspace '${slug}' not found or inactive.`);
    }

    return successResponse(res, "Workspace found", rows[0]);
  });

  /** Check a tenant slug before checkout and return verified alternatives. */
  checkSlugAvailability = asyncHandler(async (req, res) => {
    const result = await paymentService.getWorkspaceAvailability(req.params.slug);
    return successResponse(
      res,
      result.available ? "Workspace URL is available" : "Workspace URL is already in use",
      result,
    );
  });

  /** Create a server-priced Stripe Checkout Session or Razorpay Order. */
  createCheckout = asyncHandler(async (req, res) => {
    try {
      const checkout = await paymentService.createCheckout({
        ...req.body,
        avatarUrl: req.file?.path || "",
        avatarPublicId: req.file?.filename || "",
      });
      return successResponse(res, "Secure checkout created", checkout, 201);
    } catch (error) {
      if (req.file?.filename) {
        await deleteUploadedImage(req.file.filename).catch(() => {});
      }
      throw error;
    }
  });

  /** Verify Stripe server-side, then provision the paid workspace. */
  verifyStripeCheckout = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyStripeCheckout(req.body);
    return successResponse(
      res,
      "Stripe payment verified and workspace provisioned",
      result,
      201,
    );
  });

  /** Verify Razorpay signature and capture, then provision the paid workspace. */
  verifyRazorpayCheckout = asyncHandler(async (req, res) => {
    const result = await paymentService.verifyRazorpayCheckout(req.body);
    return successResponse(
      res,
      "Razorpay payment verified and workspace provisioned",
      result,
      201,
    );
  });

  /** Recover a safe checkout/provisioning status after a page refresh. */
  getCheckoutStatus = asyncHandler(async (req, res) => {
    const result = await paymentService.getCheckoutStatus(req.params.checkoutId);
    return successResponse(res, "Checkout status fetched", result);
  });

  /** Expire an unpaid checkout so the workspace details can be reused safely. */
  cancelCheckout = asyncHandler(async (req, res) => {
    const result = await paymentService.cancelCheckout(req.params.checkoutId);
    return successResponse(res, "Checkout cancelled", result);
  });

  /** Process a signature-verified Stripe event from the unparsed request body. */
  stripeWebhook = asyncHandler(async (req, res) => {
    const result = await paymentService.handleStripeWebhook(
      req.body,
      req.headers["stripe-signature"],
    );
    return successResponse(res, "Stripe webhook received", result);
  });

  /** Process a signature-verified Razorpay event from the unparsed request body. */
  razorpayWebhook = asyncHandler(async (req, res) => {
    const result = await paymentService.handleRazorpayWebhook(
      req.body,
      req.headers["x-razorpay-signature"],
    );
    return successResponse(res, "Razorpay webhook received", result);
  });

  /** List all provisioned tenants in the SaaS control plane. */
  listTenants = asyncHandler(async (req, res) => {
    const platformPool = tenantManager.getPlatformPool();
    const [tenants] = await platformPool.execute(
      `SELECT t.id, t.company_name, t.slug, t.contact_name, t.contact_email,
              t.db_name, t.status, t.created_at, s.plan_id, p.name AS plan_name,
              s.billing_cycle, s.status AS subscription_status
       FROM tenants t
       LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
       LEFT JOIN subscription_plans p ON s.plan_id = p.id
       ORDER BY t.created_at DESC`,
    );

    return successResponse(res, "Tenants listed successfully", tenants);
  });
}

export default new SaasController();
