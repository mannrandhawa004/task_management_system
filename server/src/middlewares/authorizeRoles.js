import { ForbiddenError } from "../utils/errorHandler.js";

export const authorizeRoles =
  (...roles) =>
    (req, res, next) => {
      // console.log(req.user)
      if (req.user.role === "admin") {
        return next();
      }

      if (!req.user) {
        throw new ForbiddenError("Access denied");
      }

      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError("You do not have permission");
      }

      next();
    };
