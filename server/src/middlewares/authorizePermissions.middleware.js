import AuthModel from "../models/auth.model.js";
import { ForbiddenError } from "../utils/errorHandler.js";

// Roles that bypass all permission checks (full system access)
// NOTE: "hr" is intentionally excluded — HR permissions are evaluated normally
const BYPASS_ROLES = ["super_admin", "admin"];

// Normalize permission names to support legacy checks and aliases
const normalizePermission = (name) => {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase();
  if (cleaned === "project_member_added") return "add_project_member";
  if (cleaned === "remove_project_member_removed") return "remove_project_member";
  return cleaned;
};

export const authorizePermissions = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError("Unauthorized");
    }

    const userRole = req.user.role ? req.user.role.toLowerCase() : "";

    // Super Admin and Admin bypass all permission checks
    if (BYPASS_ROLES.includes(userRole)) {
      return next();
    }

    const userPermissions = await AuthModel.getUserPermissions(req.user.id);
    const permissionNames = userPermissions.map((p) => normalizePermission(p.permission));

    const requestedPermissions = permissions.map((p) => normalizePermission(p));

    const hasPermission = requestedPermissions.some((permission) =>
      permissionNames.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenError("Permission denied");
    }

    next();
  };
};