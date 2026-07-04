import { executeQuery } from "../utils/dbQuery.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

class SearchController {
  globalSearch = asyncHandler(async (req, res) => {
    const { q = "", type = "all" } = req.query;
    const user = req.user;

    if (!user || !user.id) {
      return successResponse(res, "Search results", {
        users: [],
        projects: [],
        tasks: [],
        departments: [],
        teams: [],
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const userRole = user.role ? user.role.toLowerCase() : "";
    const isAdmin = userRole === "super_admin" || userRole === "admin";
    const isHr = userRole === "hr";
    const isGlobalView = isAdmin || isHr;

    const departmentId = Number(user.department_id || 0);
    const teamId = Number(user.team_id || 0);
    const userId = Number(user.id);

    const promises = {};

    // 1. SEARCH USERS / EMPLOYEES
    if (type === "all" || type === "users") {
      if (isGlobalView) {
        promises.users = executeQuery(
          `SELECT u.id, u.name, u.first_name, u.last_name, u.email, u.avatar, u.employee_id, u.status, r.name as role_name, d.name as department_name, t.name as team_name 
           FROM users u 
           LEFT JOIN roles r ON u.role_id = r.id 
           LEFT JOIN departments d ON u.department_id = d.id 
           LEFT JOIN teams t ON u.team_id = t.id 
           WHERE (u.name LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?) 
           ORDER BY u.name ASC LIMIT 15`,
          [searchTerm, searchTerm, searchTerm, searchTerm]
        );
      } else {
        promises.users = executeQuery(
          `SELECT u.id, u.name, u.first_name, u.last_name, u.email, u.avatar, u.employee_id, u.status, r.name as role_name, d.name as department_name, t.name as team_name 
           FROM users u 
           LEFT JOIN roles r ON u.role_id = r.id 
           LEFT JOIN departments d ON u.department_id = d.id 
           LEFT JOIN teams t ON u.team_id = t.id 
           WHERE (u.name LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?) 
             AND (u.department_id = ? OR u.team_id = ? OR u.id = ?) 
           ORDER BY u.name ASC LIMIT 15`,
          [searchTerm, searchTerm, searchTerm, searchTerm, departmentId, teamId, userId]
        );
      }
    } else {
      promises.users = Promise.resolve([]);
    }

    // 2. SEARCH PROJECTS
    if (type === "all" || type === "projects") {
      if (isAdmin) {
        promises.projects = executeQuery(
          `SELECT p.id, p.name, p.description, p.status, p.created_at, u.name as creator_name 
           FROM projects p 
           LEFT JOIN users u ON p.created_by = u.id 
           WHERE (p.name LIKE ?) 
           ORDER BY p.created_at DESC LIMIT 15`,
          [searchTerm]
        );
      } else {
        promises.projects = executeQuery(
          `SELECT DISTINCT p.id, p.name, p.description, p.status, p.created_at, u.name as creator_name 
           FROM projects p 
           LEFT JOIN users u ON p.created_by = u.id 
           LEFT JOIN project_members pm ON pm.project_id = p.id 
           WHERE (p.name LIKE ?) 
             AND (p.created_by = ? OR pm.user_id = ?) 
           ORDER BY p.created_at DESC LIMIT 15`,
          [searchTerm, userId, userId]
        );
      }
    } else {
      promises.projects = Promise.resolve([]);
    }

    // 3. SEARCH TASKS
    if (type === "all" || type === "tasks") {
      if (isAdmin) {
        promises.tasks = executeQuery(
          `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date, p.name as project_name, p.id as project_id 
           FROM tasks t 
           LEFT JOIN projects p ON t.project_id = p.id 
           WHERE (t.title LIKE ?) 
           ORDER BY t.created_at DESC LIMIT 15`,
          [searchTerm]
        );
      } else {
        promises.tasks = executeQuery(
          `SELECT DISTINCT t.id, t.title, t.description, t.status, t.priority, t.due_date, p.name as project_name, p.id as project_id 
           FROM tasks t 
           LEFT JOIN projects p ON t.project_id = p.id 
           WHERE (t.title LIKE ?) 
             AND (t.created_by = ? 
                  OR t.id IN (SELECT task_id FROM task_assignees WHERE user_id = ?) 
                  OR t.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)) 
           ORDER BY t.created_at DESC LIMIT 15`,
          [searchTerm, userId, userId, userId]
        );
      }
    } else {
      promises.tasks = Promise.resolve([]);
    }

    // 4. SEARCH DEPARTMENTS
    if (type === "all" || type === "departments") {
      if (isGlobalView) {
        promises.departments = executeQuery(
          `SELECT d.id, d.name, d.description, d.status, 
                  (SELECT COUNT(u.id) FROM users u WHERE u.department_id = d.id) as user_count 
           FROM departments d 
           WHERE (d.name LIKE ?) 
           ORDER BY d.name ASC LIMIT 10`,
          [searchTerm]
        );
      } else {
        if (departmentId > 0) {
          promises.departments = executeQuery(
            `SELECT d.id, d.name, d.description, d.status, 
                    (SELECT COUNT(u.id) FROM users u WHERE u.department_id = d.id) as user_count 
             FROM departments d 
             WHERE (d.name LIKE ?) AND d.id = ? 
             ORDER BY d.name ASC LIMIT 10`,
            [searchTerm, departmentId]
          );
        } else {
          promises.departments = Promise.resolve([]);
        }
      }
    } else {
      promises.departments = Promise.resolve([]);
    }

    // 5. SEARCH TEAMS
    if (type === "all" || type === "teams") {
      if (isGlobalView) {
        promises.teams = executeQuery(
          `SELECT t.id, t.name, t.description, d.name as department_name, u.name as lead_name 
           FROM teams t 
           LEFT JOIN departments d ON t.department_id = d.id 
           LEFT JOIN users u ON t.lead_id = u.id 
           WHERE (t.name LIKE ?) 
           ORDER BY t.name ASC LIMIT 10`,
          [searchTerm]
        );
      } else {
        promises.teams = executeQuery(
          `SELECT DISTINCT t.id, t.name, t.description, d.name as department_name, u.name as lead_name 
           FROM teams t 
           LEFT JOIN departments d ON t.department_id = d.id 
           LEFT JOIN users u ON t.lead_id = u.id 
           LEFT JOIN team_members tm ON tm.team_id = t.id 
           WHERE (t.name LIKE ?) 
             AND (t.department_id = ? OR t.lead_id = ? OR tm.user_id = ? OR t.id = ?) 
           ORDER BY t.name ASC LIMIT 10`,
          [searchTerm, departmentId, userId, userId, teamId]
        );
      }
    } else {
      promises.teams = Promise.resolve([]);
    }

    const [users, projects, tasks, departments, teams] = await Promise.all([
      promises.users,
      promises.projects,
      promises.tasks,
      promises.departments,
      promises.teams,
    ]);

    return successResponse(
      res,
      "Search results fetched successfully",
      {
        users: users || [],
        projects: projects || [],
        tasks: tasks || [],
        departments: departments || [],
        teams: teams || [],
      },
      200
    );
  });
}

export default new SearchController();
