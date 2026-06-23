import AuditModel from "../models/audit.model.js";
import { NotFoundError } from "../utils/errorHandler.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

let ioInstance = null;

export const setAuditServiceIO = (io) => {
  ioInstance = io;
};


class AuditService {
  async log(data) {
    const result = await AuditModel.createLog(data);

    if (ioInstance) {
      try {
        const logDetails = {
          id: result.insertId,
          ...data,
          created_at: new Date().toISOString(),
        };

        ioInstance.emit("audit_log_created", logDetails);

        if (data.entity_type === "project") {
          ioInstance.emit("project_updated", {
            id: data.entity_id,
            action: data.action,
          });
        }

        if (data.entity_type === "task") {
          const eventPayload = {
            id: data.entity_id,
            taskId: data.entity_id,
            projectId: data.details?.project_id || data.details?.projectId,
            action: data.action,
          };

          if (data.action === AUDIT_ACTIONS.CREATE_TASK) {
            ioInstance.emit("task_created", eventPayload);
          }

          if (
            data.action !== AUDIT_ACTIONS.CREATE_TASK &&
            data.action !== AUDIT_ACTIONS.DELETE_TASK
          ) {
            ioInstance.emit("task_updated", eventPayload);
          }
        }
      } catch (err) {
        console.error("Socket emission failed:", err.message);
      }
    }

    return result;
  }

  async getAllLogs(query) {
    return await AuditModel.getAllLogs(query);
  }

  async getLogById(id) {
    const log = await AuditModel.getLogById(id);
    if (!log) {
      throw new NotFoundError("Audit log not found");
    }
    return log;
  }

  async getProjectLogs(projectId) {
    return await AuditModel.getProjectLogs(projectId);
  }

  async getTaskLogs(taskId) {
    return await AuditModel.getTaskLogs(taskId);
  }
}

export default new AuditService();
