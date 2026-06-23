import { ForbiddenError } from "../utils/errorHandler.js";

export const authorizeRoles =
  (...roles) =>
    (req, res, next) => {
      if (!req.user) {
        throw new ForbiddenError("Access denied");
      }

      const userRole = req.user.role ? req.user.role.toLowerCase() : "";

      // Super Admin and Admin bypass role checks
      if (userRole === "super_admin" || userRole === "admin") {
        return next();
      }

      const allowedRoles = roles.map((r) => r.toLowerCase());

      // Map member checks to employee for backward compatibility
      if (allowedRoles.includes("member") && !allowedRoles.includes("employee")) {
        allowedRoles.push("employee");
      }

      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError("You do not have permission");
      }

      next();
    };
