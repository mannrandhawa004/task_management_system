import { executeQuery } from "../utils/dbQuery.js";

class AuditModel {
  parseDetails(details) {
    if (!details) return null;

    if (typeof details === "object") return details;

    try {
      return JSON.parse(details);
    } catch (error) {
      return {};
    }
  }

  formatLog(log) {
    const details = this.parseDetails(log.details);
    const projectId = log.project_id || details?.project_id || details?.projectId || details?.project?.id || details?.deleted_project?.id;
    const projectName = log.project_name || details?.project_name || details?.projectName || details?.project?.name || details?.deleted_project?.name;
    const taskId = log.task_id || details?.task_id || details?.taskId || details?.deleted_task_id || details?.task?.id || details?.deleted_task?.id;
    const taskTitle = log.task_title || details?.task_title || details?.title || details?.task?.title || details?.deleted_task?.title;

    return {
      ...log,
      details,
      project: projectId
        ? {
          id: projectId,
          name: projectName || null,
        }
        : null,
      task: taskId
        ? {
          id: taskId,
          title: taskTitle || null,
        }
        : null,
    };
  }

  async createLog({
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address,
  }) {
    const query = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return await executeQuery(query, [
      user_id,
      action,
      entity_type,
      entity_id,
      JSON.stringify(details || {}),
      ip_address || null,
    ]);
  }

  // UPDATED: Supports Pagination, Entity Scoping, and CRUD Group Filtering
  async getAllLogs({ page = 1, limit = 10, entity_type = null, action_group = null }) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const queryParams = [];
    const countParams = [];

    let filterConditions = "";

    // 1. Filter by Entity Context Type (project vs task)
    if (entity_type && entity_type !== "all") {
      filterConditions += " WHERE al.entity_type = ? ";
      queryParams.push(entity_type);
      countParams.push(entity_type);
    }

    // 2. Filter by CRUD Operation Groupings
    if (action_group && action_group !== "all") {
      const prefixCondition = filterConditions ? " AND " : " WHERE ";
      filterConditions += `${prefixCondition} al.action LIKE ? `;
      queryParams.push(`${action_group}%`); // e.g., 'CREATE_%' or 'DELETE_%'
      countParams.push(`${action_group}%`);
    }

    // Total Count Query for pagination indicators calculation
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM audit_logs al
      ${filterConditions}
    `;
    const countResult = await executeQuery(countQuery, countParams);
    const totalRecords = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // Primary Data Fetch Ledger Query
    const dataQuery = `
      SELECT
  al.id,
  u.name AS user_name,

   CASE
    WHEN LOWER(system_role.name) = 'admin'
      THEN system_role.name
    ELSE project_role.name
  END AS role_name,

  al.action,
  al.entity_type,
  al.entity_id,
  al.ip_address,
  al.details,
  al.created_at

FROM audit_logs al

LEFT JOIN users u
  ON u.id = al.user_id

LEFT JOIN tasks t
  ON al.entity_type = 'task'
 AND t.id = al.entity_id

LEFT JOIN projects task_project
  ON task_project.id = t.project_id

LEFT JOIN projects project_entity
  ON al.entity_type = 'project'
 AND project_entity.id = al.entity_id

LEFT JOIN roles system_role
  ON system_role.id = u.role_id

LEFT JOIN project_members pm
  ON pm.user_id = al.user_id
 AND pm.project_id = COALESCE(task_project.id, project_entity.id)

LEFT JOIN project_roles project_role
  ON project_role.id = pm.role_id

${filterConditions}

ORDER BY al.created_at DESC
LIMIT ? OFFSET ?;
    `;

    queryParams.push(parseInt(limit), offset);
    const logs = await executeQuery(dataQuery, queryParams);

    return {
      data: logs.map((log) => this.formatLog(log)),
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      }
    };
  }

  async getLogById(id) {
    const query = `
      SELECT
        al.*,
        u.name AS user_name,
        r.name AS role,
        t.id AS task_id,
        t.title AS task_title,
        COALESCE(task_project.id, project_entity.id) AS project_id,
        COALESCE(task_project.name, project_entity.name) AS project_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN tasks t ON al.entity_type = 'task' AND t.id = al.entity_id
      LEFT JOIN projects task_project ON task_project.id = t.project_id
      LEFT JOIN projects project_entity ON al.entity_type = 'project' AND project_entity.id = al.entity_id
      WHERE al.id = ?
      LIMIT 1
    `;
    const result = await executeQuery(query, [id]);
    if (!result[0]) return null;

    return this.formatLog(result[0]);
  }

  async getProjectLogs(projectId) {
    const query = `
      SELECT
        al.*,
        u.name AS user_name,
        r.name AS role,
        t.id AS task_id,
        t.title AS task_title,
        COALESCE(task_project.id, project_entity.id) AS project_id,
        COALESCE(task_project.name, project_entity.name) AS project_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN tasks t ON al.entity_type = 'task' AND t.id = al.entity_id
      LEFT JOIN projects task_project ON task_project.id = t.project_id
      LEFT JOIN projects project_entity ON al.entity_type = 'project' AND project_entity.id = al.entity_id
      WHERE
        (al.entity_type = 'project' AND al.entity_id = ?)
        OR (al.entity_type = 'task' AND t.project_id = ?)
      ORDER BY al.created_at DESC
    `;
    const logs = await executeQuery(query, [projectId, projectId]);
    return {
      data: logs.map((log) => this.formatLog(log))
    };
  }

  async getTaskLogs(taskId) {
    const query = `
      SELECT
        al.*,
        u.name AS user_name,
        r.name AS role,
        t.id AS task_id,
        t.title AS task_title,
        task_project.id AS project_id,
        task_project.name AS project_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN tasks t ON al.entity_type = 'task' AND t.id = al.entity_id
      LEFT JOIN projects task_project ON task_project.id = t.project_id
      WHERE al.entity_type = 'task' AND al.entity_id = ?
      ORDER BY al.created_at DESC
    `;
    const logs = await executeQuery(query, [taskId]);
    return {
      data: logs.map((log) => this.formatLog(log))
    };
  }
}

export default new AuditModel();
