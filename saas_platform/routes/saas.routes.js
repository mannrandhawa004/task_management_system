import express from "express";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

import SaasController from "../controllers/saas.controller.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(path.join(__dirname, "../../server/package.json"));
const rateLimit = require("express-rate-limit");

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many checkout attempts. Please wait before trying again.",
  },
});

router.get("/plans", SaasController.getPlans);
router.get("/tenants/lookup/:slug", SaasController.lookupTenant);

// `/checkout` remains as a compatibility alias, but it now only creates a
// gateway checkout. The old mock-card path can no longer provision an account.
router.post("/checkout", checkoutLimiter, SaasController.createCheckout);
router.post("/checkout/session", checkoutLimiter, SaasController.createCheckout);
router.post(
  "/checkout/stripe/verify",
  checkoutLimiter,
  SaasController.verifyStripeCheckout,
);
router.post(
  "/checkout/razorpay/verify",
  checkoutLimiter,
  SaasController.verifyRazorpayCheckout,
);
router.get(
  "/checkout/:checkoutId/status",
  checkoutLimiter,
  SaasController.getCheckoutStatus,
);
router.post(
  "/checkout/:checkoutId/cancel",
  checkoutLimiter,
  SaasController.cancelCheckout,
);

router.get("/tenants", SaasController.listTenants);

export default router;
