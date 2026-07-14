import { tenantManager } from "../services/TenantConnectionManager.js";
import { provisioningService } from "../services/TenantProvisioningService.js";
import { asyncHandler } from "../../server/src/utils/asyncHandler.js";
import { successResponse } from "../../server/src/utils/response.js";
import { BadRequestError, NotFoundError } from "../../server/src/utils/errorHandler.js";

class SaasController {
  /**
   * GET /v1/saas/plans
   * List all available subscription pricing plans from platform database.
   */
  getPlans = asyncHandler(async (req, res) => {
    const platformPool = tenantManager.getPlatformPool();
    const [plans] = await platformPool.execute(
      `SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price_monthly ASC`
    );

    // Parse features_json
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      features: typeof plan.features_json === "string" ? JSON.parse(plan.features_json) : plan.features_json,
    }));

    return successResponse(res, "Available subscription plans fetched successfully", formattedPlans);
  });

  /**
   * GET /v1/saas/tenants/lookup/:slug
   * Verify whether a workspace slug exists and is active (for login scoping).
   */
  lookupTenant = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    if (!slug) throw new BadRequestError("Workspace slug is required");

    const platformPool = tenantManager.getPlatformPool();
    const [rows] = await platformPool.execute(
      `SELECT id, company_name, slug, logo_url, status FROM tenants WHERE slug = ? AND status IN ('active', 'trial') LIMIT 1`,
      [slug.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      throw new NotFoundError(`Workspace '${slug}' not found or inactive.`);
    }

    return successResponse(res, "Workspace found", rows[0]);
  });

  /**
   * POST /v1/saas/checkout
   * Process subscription checkout and automatically provision tenant database & Super Admin account.
   */
  checkoutAndProvision = asyncHandler(async (req, res) => {
    const {
      companyName,
      slug,
      contactName,
      contactEmail,
      contactPhone,
      planId,
      billingCycle,
      adminPassword,
      paymentMethod = "mock_card",
      cardNumber,
    } = req.body;

    if (!companyName || !slug || !contactEmail || !adminPassword) {
      throw new BadRequestError("Company name, workspace slug, contact email, and password are required.");
    }

    // Mock payment validation
    if (paymentMethod === "mock_card" && (!cardNumber || cardNumber.length < 4)) {
      throw new BadRequestError("Invalid payment card details.");
    }

    const provisionResult = await provisioningService.provisionTenant({
      companyName,
      slug,
      contactName,
      contactEmail,
      contactPhone,
      planId: planId ? Number(planId) : 1,
      billingCycle: billingCycle || "monthly",
      adminPassword,
    });

    return successResponse(
      res,
      `🎉 Welcome to ${companyName}! Your isolated workspace database has been provisioned.`,
      provisionResult,
      201
    );
  });

  /**
   * GET /v1/saas/tenants
   * List all registered tenants in the SaaS platform control plane.
   */
  listTenants = asyncHandler(async (req, res) => {
    const platformPool = tenantManager.getPlatformPool();
    const [tenants] = await platformPool.execute(
      `SELECT t.id, t.company_name, t.slug, t.contact_name, t.contact_email, t.db_name, t.status, t.created_at,
              s.plan_id, p.name as plan_name, s.billing_cycle, s.status as subscription_status
       FROM tenants t
       LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
       LEFT JOIN subscription_plans p ON s.plan_id = p.id
       ORDER BY t.created_at DESC`
    );

    return successResponse(res, "Tenants listed successfully", tenants);
  });
}

export default new SaasController();
