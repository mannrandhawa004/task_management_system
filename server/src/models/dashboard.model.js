// 📑 Location: src/models/dashboard.model.js
import { executeQuery } from "../utils/dbQuery.js";

class DashboardModel {
    _mapTaskRows(rows) {
        return rows.map(row => ({
            ...row,
            project: typeof row.project === 'string' ? JSON.parse(row.project) : row.project,
            assigned_users: typeof row.assigned_users === 'string' ? JSON.parse(row.assigned_users) : row.assigned_users
        }));
    }

    async countProjects(user, isAdmin, onlyActive = false) {
        let query = `SELECT COUNT(DISTINCT p.id) as count FROM projects p `;
        const params = [];

        if (!isAdmin) {
            query += `JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ? `;
            params.push(user.id);
        }

        if (onlyActive) {
            query += !isAdmin ? `AND p.status = 'active'` : `WHERE p.status = 'active'`;
        }

        const res = await executeQuery(query, params);
        return res[0]?.count || 0;
    }

    async fetchPaginatedProjects(user, isAdmin, { offset, limit }) {
        let query = `
      SELECT p.id, p.name, p.description, p.status, p.created_at,
             (SELECT u.name FROM users u WHERE u.id = p.created_by) as creator,
             (SELECT COUNT(id) FROM tasks t WHERE t.project_id = p.id) as total_tasks_count,
             (SELECT COUNT(id) FROM tasks t WHERE t.project_id = p.id AND t.status IN('in_progress','todo')) as remain_tasks
      FROM projects p `;
        const params = [];

        if (!isAdmin) {
            query += `JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ? AND p.status = 'active' `;
            params.push(user.id);
        } else {
            query += `WHERE p.status = 'active' `;
        }

        query += `ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        return executeQuery(query, params);
    }


    async countTotalTasks(user, isAdmin) {
        let query = `SELECT COUNT(*) as count FROM tasks t `;
        const params = [];

        if (!isAdmin) {
            query += `JOIN project_members pm ON pm.project_id = t.project_id WHERE pm.user_id = ?`;
            params.push(user.id);
        }
        const res = await executeQuery(query, params);
        return res[0]?.count || 0;
    }

    async countFilteredTasks(user, isAdmin, status) {
        let query = `SELECT COUNT(id) as count FROM tasks t WHERE t.status = ? `;
        const params = [status];

        if (!isAdmin) {
            query += `AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
            params.push(user.id);
        }
        const res = await executeQuery(query, params);
        return res[0]?.count || 0;
    }

    async fetchPaginatedTasks(user, isAdmin, { status, offset, limit }) {
        let query = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
             JSON_OBJECT('id', p.id, 'name', p.name) as project,
             COALESCE((
               SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name))
               FROM task_assignees ta JOIN users u ON ta.user_id = u.id WHERE ta.task_id = t.id
             ), JSON_ARRAY()) as assigned_users
      FROM tasks t
      JOIN projects p ON t.project_id = p.id `;
        const params = [];

        if (!isAdmin) {
            query += `JOIN project_members pm ON pm.project_id = t.project_id WHERE pm.user_id = ? AND t.status = ? `;
            params.push(user.id, status);
        } else {
            query += `WHERE t.status = ? `;
            params.push(status);
        }

        query += `ORDER BY t.due_date ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rows = await executeQuery(query, params);
        return this._mapTaskRows(rows);
    }

    // ── OVERDUE SYSTEM CRITICAL FILTERS ──
    async countOverdueTasks(user, isAdmin) {
        let query = `SELECT COUNT(*) as count 
      FROM tasks t 
      WHERE t.status != 'completed'
        AND (
          t.due_date < NOW()
          OR t.due_date <= DATE_ADD(NOW(), INTERVAL 4 DAY)
        ) `;
        const params = [];

        if (!isAdmin) {
            query += `AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
            params.push(user.id);
        }
        const res = await executeQuery(query, params);
        return res[0]?.count || 0;
    }


    async fetchPaginatedOverdueTasks(user, isAdmin, { offset, limit }) {
        let query = `
      SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
             JSON_OBJECT('id', p.id, 'name', p.name) as project,
             COALESCE((
               SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name, 'email', u.email))
               FROM task_assignees ta 
               JOIN users u ON ta.user_id = u.id 
               WHERE ta.task_id = t.id
             ), JSON_ARRAY()) as assigned_users
      FROM tasks t
      JOIN projects p ON t.project_id = p.id 
      WHERE t.status != 'completed' 
        AND (
          t.due_date < NOW()                                    
          OR t.due_date <= DATE_ADD(NOW(), INTERVAL 4 DAY)      
        )
    `;
        const params = [];

        if (!isAdmin) {
            query += `AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?) `;
            params.push(user.id);
        }

        query += `ORDER BY t.due_date ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const rows = await executeQuery(query, params);
        return this._mapTaskRows(rows);
    }
    /**
     * Fetch top N projects with the most recent audit_log activity.
     * Considers both direct project operations AND task operations
     * belonging to each project.
     */
    async fetchRecentlyActiveProjects(user, isAdmin, { limit = 5 }) {
        const params = [];

        let memberFilter = '';
        if (!isAdmin) {
            memberFilter = `AND p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
            params.push(user.id);
        }

        const query = `
            SELECT
                p.id,
                p.name,
                p.description,
                p.status,
                p.created_at,
                (SELECT u.name FROM users u WHERE u.id = p.created_by) AS creator_name,
                (SELECT COUNT(id) FROM tasks t WHERE t.project_id = p.id) AS tasks_count,
                activity.last_activity_at,
                activity.activity_count,
                activity.last_action,
                activity.last_entity_type,
                activity.last_actor_name
            FROM projects p
            INNER JOIN (
                SELECT
                    project_id,
                    MAX(created_at) AS last_activity_at,
                    COUNT(*) AS activity_count,
                    (SELECT al2.action FROM audit_logs al2
                     LEFT JOIN tasks t2 ON al2.entity_type = 'task' AND t2.id = al2.entity_id
                     WHERE COALESCE(
                         CASE WHEN al2.entity_type = 'project' THEN al2.entity_id END,
                         t2.project_id,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al2.details, '$.project_id')), '') + 0,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al2.details, '$.projectId')), '') + 0
                     ) = sub.project_id
                     ORDER BY al2.created_at DESC LIMIT 1
                    ) AS last_action,
                    (SELECT al3.entity_type FROM audit_logs al3
                     LEFT JOIN tasks t3 ON al3.entity_type = 'task' AND t3.id = al3.entity_id
                     WHERE COALESCE(
                         CASE WHEN al3.entity_type = 'project' THEN al3.entity_id END,
                         t3.project_id,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al3.details, '$.project_id')), '') + 0,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al3.details, '$.projectId')), '') + 0
                     ) = sub.project_id
                     ORDER BY al3.created_at DESC LIMIT 1
                    ) AS last_entity_type,
                    (SELECT u2.name FROM audit_logs al4
                     LEFT JOIN tasks t4 ON al4.entity_type = 'task' AND t4.id = al4.entity_id
                     LEFT JOIN users u2 ON u2.id = al4.user_id
                     WHERE COALESCE(
                         CASE WHEN al4.entity_type = 'project' THEN al4.entity_id END,
                         t4.project_id,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al4.details, '$.project_id')), '') + 0,
                         NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al4.details, '$.projectId')), '') + 0
                     ) = sub.project_id
                     ORDER BY al4.created_at DESC LIMIT 1
                    ) AS last_actor_name
                FROM (
                    SELECT
                        al.id,
                        al.created_at,
                        COALESCE(
                            CASE WHEN al.entity_type = 'project' THEN al.entity_id END,
                            t.project_id,
                            NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.project_id')), '') + 0,
                            NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.projectId')), '') + 0
                        ) AS project_id
                    FROM audit_logs al
                    LEFT JOIN tasks t ON al.entity_type = 'task' AND t.id = al.entity_id
                    WHERE COALESCE(
                        CASE WHEN al.entity_type = 'project' THEN al.entity_id END,
                        t.project_id,
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.project_id')), '') + 0,
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.projectId')), '') + 0
                    ) IS NOT NULL
                ) AS sub
                GROUP BY project_id
            ) AS activity ON activity.project_id = p.id
            WHERE 1 = 1
            ${memberFilter}
            ORDER BY activity.last_activity_at DESC
            LIMIT ?
        `;
        params.push(limit);

        return executeQuery(query, params);
    }

    /**
     * Fetch top N tasks with the most recent audit_log activity.
     * Shows recently updated/created tasks across all accessible projects.
     */
    async fetchRecentlyActiveTasks(user, isAdmin, { limit = 5 }) {
        const params = [];

        let memberFilter = '';
        if (!isAdmin) {
            memberFilter = `AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
            params.push(user.id);
        }

        const query = `
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.created_at,
                JSON_OBJECT('id', p.id, 'name', p.name) as project,
                COALESCE((
                    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', u.id, 'name', u.name))
                    FROM task_assignees ta JOIN users u ON ta.user_id = u.id WHERE ta.task_id = t.id
                ), JSON_ARRAY()) as assigned_users,
                activity.last_activity_at,
                activity.activity_count,
                activity.last_action,
                activity.last_actor_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            INNER JOIN (
                SELECT
                    sub.entity_id as task_id,
                    MAX(sub.created_at) AS last_activity_at,
                    COUNT(*) AS activity_count,
                    (SELECT al2.action FROM audit_logs al2
                     WHERE al2.entity_type = 'task' AND al2.entity_id = sub.entity_id
                     ORDER BY al2.created_at DESC LIMIT 1
                    ) AS last_action,
                    (SELECT u2.name FROM audit_logs al3
                     LEFT JOIN users u2 ON u2.id = al3.user_id
                     WHERE al3.entity_type = 'task' AND al3.entity_id = sub.entity_id
                     ORDER BY al3.created_at DESC LIMIT 1
                    ) AS last_actor_name
                FROM (
                    SELECT
                        al.id,
                        al.created_at,
                        al.entity_id
                    FROM audit_logs al
                    WHERE al.entity_type = 'task'
                ) AS sub
                GROUP BY sub.entity_id
            ) AS activity ON activity.task_id = t.id
            WHERE 1 = 1
            ${memberFilter}
            ORDER BY activity.last_activity_at DESC
            LIMIT ?
        `;
        params.push(limit);

        const rows = await executeQuery(query, params);
        return this._mapTaskRows(rows);
    }
    async getDailyTaskProgress(user, isAdmin, { days = 30 } = {}) {
        const params = [days];

        let memberFilter = '';
        if (!isAdmin) {
            memberFilter = `AND t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
            params.push(user.id);
        }

        const query = `
            SELECT 
                DATE(t.updated_at) as date,
                COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_count,
                COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_count,
                COUNT(*) as total_tasks_updated
            FROM tasks t
            WHERE t.updated_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${memberFilter}
            GROUP BY DATE(t.updated_at)
            ORDER BY date ASC
        `;

        return await executeQuery(query, params);
    }

    async getAdminMetrics() {
        const queryCounts = `
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM departments) as total_departments,
                (SELECT COUNT(*) FROM teams) as total_teams,
                (SELECT COUNT(*) FROM projects) as total_projects,
                (SELECT COUNT(*) FROM tasks) as total_tasks
        `;
        const queryAttendance = `
            SELECT 
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
                COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
                COUNT(CASE WHEN status = 'half_day' THEN 1 END) as half_day,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
                COUNT(CASE WHEN status = 'remote' THEN 1 END) as remote,
                COUNT(CASE WHEN status = 'on_leave' THEN 1 END) as on_leave
            FROM attendance
            WHERE date = CURRENT_DATE()
        `;

        const [counts, attendance] = await Promise.all([
            executeQuery(queryCounts),
            executeQuery(queryAttendance)
        ]);

        return {
            counts: counts[0],
            attendance: attendance[0]
        };
    }

    async getDepartmentMetrics(departmentId) {
        const queryCounts = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE department_id = ?) as total_users,
                (SELECT COUNT(*) FROM projects WHERE department_id = ?) as total_projects,
                (SELECT COUNT(*) FROM teams WHERE department_id = ?) as total_teams
        `;
        const queryTasks = `
            SELECT 
                COUNT(t.id) as total_tasks,
                COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
                COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
                COUNT(CASE WHEN t.status = 'todo' THEN 1 END) as todo_tasks
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.department_id = ?
        `;
        const queryAttendance = `
            SELECT 
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
                COUNT(CASE WHEN a.status = 'half_day' THEN 1 END) as half_day,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
                COUNT(CASE WHEN a.status = 'remote' THEN 1 END) as remote,
                COUNT(CASE WHEN a.status = 'on_leave' THEN 1 END) as on_leave
            FROM attendance a
            JOIN users u ON a.user_id = u.id
            WHERE u.department_id = ? AND a.date = CURRENT_DATE()
        `;

        const [counts, tasks, attendance] = await Promise.all([
            executeQuery(queryCounts, [departmentId, departmentId, departmentId]),
            executeQuery(queryTasks, [departmentId]),
            executeQuery(queryAttendance, [departmentId])
        ]);

        return {
            counts: counts[0],
            tasks: tasks[0],
            attendance: attendance[0]
        };
    }

    async getUserMetrics(userId) {
        const queryTasks = `
            SELECT 
                COUNT(id) as total_assigned,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status = 'todo' THEN 1 END) as pending
            FROM tasks
            WHERE id IN (
                SELECT task_id FROM task_assignees WHERE user_id = ?
            )
        `;

        const [tasks] = await Promise.all([
            executeQuery(queryTasks, [userId])
        ]);

        return {
            tasks: tasks[0]
        };
    }
}

export default new DashboardModel();
