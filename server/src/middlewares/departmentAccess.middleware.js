import { ForbiddenError } from "../utils/errorHandler.js";

// Roles that have global department access without restriction
// NOTE: "hr" is intentionally excluded — HR is scoped to their own department
const BYPASS_ROLES = ["super_admin", "admin"];

/**
 * Middleware to restrict department resource access.
 * Admins/Super Admins can access any department.
 * Department Heads and other employees can only access their own department.
 */
export const departmentAccessMiddleware = async (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError("Unauthorized");
  }

  const userRole = req.user.role ? req.user.role.toLowerCase() : "";

  // Super Admin and Admin bypass department boundary checks
  if (BYPASS_ROLES.includes(userRole)) {
    return next();
  }

  // Find department ID from parameters or query or body
  const departmentId = req.params.departmentId || req.params.id || req.query.departmentId || req.body.departmentId;

  if (!departmentId) {
    return next();
  }

  // Compare user's department ID with requested department ID
  // Note: We use dynamic lookup of user department or compare with req.user.department_id
  const userDeptId = req.user.department_id;

  if (Number(userDeptId) !== Number(departmentId)) {
    throw new ForbiddenError("Access denied: You do not belong to this department");
  }

  next();
};

/**
 * Restricts management operations to Department Heads of that specific department.
 */
export const departmentHeadMiddleware = async (req, res, next) => {
  if (!req.user) {
    throw new ForbiddenError("Unauthorized");
  }

  const userRole = req.user.role ? req.user.role.toLowerCase() : "";

  // Super Admin and Admin bypass
  if (BYPASS_ROLES.includes(userRole)) {
    return next();
  }

  if (userRole !== "dept_head") {
    throw new ForbiddenError("Access denied: Department Head permissions required");
  }

  // Find department ID
  const departmentId = req.params.departmentId || req.params.id || req.query.departmentId || req.body.departmentId;

  if (departmentId && Number(req.user.department_id) !== Number(departmentId)) {
    throw new ForbiddenError("Access denied: You are not the Department Head of this department");
  }

  next();
};
