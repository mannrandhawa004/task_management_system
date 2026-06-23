import ProjectModel from "../models/project.model.js";
import { ForbiddenError } from "../utils/errorHandler.js";

export const authorizeProjectRoles = (...roles) => {
  return async (req, res, next) => {
    if (req.user.role === "admin") {
      return next();
    }

    const projectId = req.params.projectId;
    const userId = req.user.id;

    const member = await ProjectModel.getMemberRole(projectId, userId);

    if (!member) {
      throw new ForbiddenError("Not part of this project");
    }

    if (!roles.includes(member.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};
