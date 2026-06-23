import AuthModel from "../models/auth.model.js";
import { ForbiddenError } from "../utils/errorHandler.js";

export const authorizePermissions = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      throw new ForbiddenError("Unauthorized");
    }

    if (req.user.role === "admin") {
      return next();
    }

    const userPermissions = await AuthModel.getUserPermissions(req.user.id);
    const permissionNames = userPermissions.map((p) => p.permission ? p.permission.trim() : "");

    // console.log("Cleaned permissions array:", permissionNames);

    const hasPermission = permissions.some((permission) =>
      permissionNames.includes(permission.trim()),
    );

    if (!hasPermission) {
      throw new ForbiddenError("Permission denied");
    }

    next();
  };
};