import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import {
  changePasswordValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
const router = Router();

// const authIpLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: { success: false, message: "Spike traffic detected from this network location. Cooling down." }
// });




// const authEmailLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   keyGenerator: (req) => {
//     if (req.body?.email) {
//       return `email_${req.body.email.toLowerCase().trim()}`;
//     }
//     return req.clientIp || req.ip;
//   },
//   validate: { keyGenerator: false },
//   message: { success: false, message: "This account has been locked due to excessive failed attempts." }
// });
router.post(
  "/register",
  (req, res) => res.status(403).json({
    success: false,
    message: "New workspace accounts are created only after a verified subscription payment.",
  }),
);
router.post("/onboarding/exchange", AuthController.onboardingExchange);
router.post("/login", loginValidator, validate, AuthController.login);
router.post("/login/2fa-verify", AuthController.verify2FALogin);
router.post("/2fa/generate", authMiddleware, AuthController.generate2FA);
router.post("/2fa/verify-setup", authMiddleware, AuthController.verify2FASetup);
router.post("/2fa/disable", authMiddleware, AuthController.disable2FA);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

router.get("/profile", authMiddleware, AuthController.profile);
router.patch(
  "/change-password",
  authMiddleware,
  changePasswordValidator,
  validate,
  AuthController.changePassword,
);
router.get(
  "/allusers",
  authMiddleware,
  AuthController.getAllUsers,
);

router.patch("/changeStatus/:id", authMiddleware, authorizeRoles("admin"), AuthController.chnageUserStatus)

export default router;
