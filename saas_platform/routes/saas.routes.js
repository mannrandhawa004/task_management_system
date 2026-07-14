import express from "express";
import SaasController from "../controllers/saas.controller.js";

const router = express.Router();

/**
 * @route   GET /v1/saas/plans
 * @desc    List available subscription pricing plans
 * @access  Public
 */
router.get("/plans", SaasController.getPlans);

/**
 * @route   GET /v1/saas/tenants/lookup/:slug
 * @desc    Check workspace slug validity before login
 * @access  Public
 */
router.get("/tenants/lookup/:slug", SaasController.lookupTenant);

/**
 * @route   POST /v1/saas/checkout
 * @desc    Purchase subscription & provision isolated tenant database + Super Admin
 * @access  Public
 */
router.post("/checkout", SaasController.checkoutAndProvision);

/**
 * @route   GET /v1/saas/tenants
 * @desc    List all provisioned tenants
 * @access  Public (for landing page demo/monitoring)
 */
router.get("/tenants", SaasController.listTenants);

export default router;
