import { Router } from "express";
import LeaveController from "../controllers/leave.controller.js";
import LeavePolicyController from "../controllers/leavePolicy.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { cacheResponse, invalidateCacheAfter } from "../middlewares/cache.middleware.js";

const router = Router();

router.use(authMiddleware);

// Policy & Balance routes
router.get(
  "/policies",
  cacheResponse({ resource: "leave-policies", ttl: 600, scope: "tenant", versionResources: ["leave-policies"], includeQuery: false }),
  LeavePolicyController.getPolicies,
);
router.post("/policies", authorizeRoles("super_admin"), invalidateCacheAfter(["leave-policies", "leaves"]), LeavePolicyController.createPolicy);
router.put("/policies/:id", authorizeRoles("super_admin"), invalidateCacheAfter(["leave-policies", "leaves"]), LeavePolicyController.updatePolicy);
router.post("/allocate", authorizeRoles("super_admin"), invalidateCacheAfter(["leaves", "dashboard"]), LeavePolicyController.allocateQuotas);
router.get("/balances", LeavePolicyController.getMyBalances);
router.get("/salary-report", authorizeRoles("super_admin", "admin", "hr"), LeavePolicyController.getSalaryReport);

// Employee routes
router.post("/apply", invalidateCacheAfter(["leaves", "dashboard"]), LeaveController.applyLeave);
router.get("/my", LeaveController.getMyLeaves);
router.get("/colleagues", LeaveController.getColleaguesOnLeave);

// Management routes
router.get("/manage", authorizeRoles("super_admin", "admin", "hr", "dept_head"), LeaveController.getManageLeaves);
router.patch("/:id/status", authorizeRoles("super_admin", "admin", "hr", "dept_head"), invalidateCacheAfter(["leaves", "dashboard"]), LeaveController.updateStatus);

export default router;
