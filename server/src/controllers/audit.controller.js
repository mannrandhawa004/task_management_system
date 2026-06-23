import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { ForbiddenError } from "../utils/errorHandler.js";
import AuditService from "../services/audit.service.js";
import ProjectModel from "../models/project.model.js";

class AuditController {

  getAllLogs = asyncHandler(async (req, res) => {
    // Admin can see all logs, others can only see logs for projects they're part of
    if (req.user.role !== "admin") {
      throw new ForbiddenError("Only admins can view all audit logs");
    }

    const logs = await AuditService.getAllLogs(req.query);
    // console.log(logs.data[0])
    return successResponse(
      res,
      "Audit logs fetched successfully",
      logs,
      200
    );
  });


  getLogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const log = await AuditService.getLogById(id);

    // Check if user has permission to view this log
    if (req.user.role !== "admin") {
      const projectId = log.project?.id;
      if (projectId) {
        const hasAccess = await ProjectModel.hasUserAccess(
          projectId,
          req.user.id
        );
        if (!hasAccess) {
          throw new ForbiddenError(
            "You don't have permission to view this audit log"
          );
        }
      }
    }

    return successResponse(
      res,
      "Audit log fetched successfully",
      log,
      200
    );
  });


  getProjectLogs = asyncHandler(async (req, res) => {

    const { id: projectId } = req.params;

    // Check if user has permission to view project logs
    if (req.user.role !== "admin") {
      const hasAccess = await ProjectModel.hasUserAccess(
        projectId,
        req.user.id
      );

      if (!hasAccess) {
        throw new ForbiddenError(
          "You don't have permission to view logs for this project"
        );
      }
    }

    const logs = await AuditService.getProjectLogs(projectId);

    return successResponse(
      res,
      "Project audit logs fetched successfully",
      logs,
      200
    );
  });


  getTaskLogs = asyncHandler(async (req, res) => {

    const { id: taskId } = req.params;

    const logs = await AuditService.getTaskLogs(taskId);

    return successResponse(
      res,
      "Task audit logs fetched successfully",
      logs,
      200
    );
  });

}

export default new AuditController();