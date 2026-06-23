import { executeQuery } from "../utils/dbQuery.js";

class DepartmentModel {
  async create({ name, description, status }) {
    const query = `
      INSERT INTO departments (name, description, status)
      VALUES (?, ?, ?)
    `;
    const result = await executeQuery(query, [name, description || null, status || "active"]);
    return result;
  }

  async getById(id) {
    const query = `SELECT * FROM departments WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async getByName(name) {
    const query = `SELECT * FROM departments WHERE name = ? LIMIT 1`;
    const rows = await executeQuery(query, [name]);
    return rows[0] || null;
  }

  async update(id, { name, description, status }) {
    const query = `
      UPDATE departments
      SET name = ?, description = ?, status = ?
      WHERE id = ?
    `;
    return await executeQuery(query, [name, description || null, status || "active", id]);
  }

  async delete(id) {
    const query = `DELETE FROM departments WHERE id = ?`;
    return await executeQuery(query, [id]);
  }

  async getAll(limit, offset) {
    const query = `
      SELECT d.*, 
        (SELECT COUNT(u.id) FROM users u WHERE u.department_id = d.id) as user_count,
        (SELECT COUNT(p.id) FROM projects p WHERE p.department_id = d.id) as project_count,
        (SELECT COUNT(t.id) FROM teams t WHERE t.department_id = d.id) as team_count
      FROM departments d
      ORDER BY d.name ASC
      LIMIT ? OFFSET ?
    `;
    return await executeQuery(query, [limit, offset]);
  }

  async count() {
    const query = `SELECT COUNT(id) AS total FROM departments`;
    const result = await executeQuery(query, []);
    return result[0]?.total || 0;
  }

  async getUsers(departmentId) {
    const query = `
      SELECT u.id, u.name, u.email, u.status, u.avatar, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.department_id = ?
      ORDER BY u.name ASC
    `;
    return await executeQuery(query, [departmentId]);
  }

  async getStats(departmentId) {
    const usersQuery = `SELECT COUNT(id) as user_count FROM users WHERE department_id = ?`;
    const projectsQuery = `SELECT COUNT(id) as project_count FROM projects WHERE department_id = ?`;
    const tasksQuery = `
      SELECT COUNT(t.id) as task_count 
      FROM tasks t 
      JOIN projects p ON t.project_id = p.id 
      WHERE p.department_id = ?
    `;

    const [userRes, projectRes, taskRes] = await Promise.all([
      executeQuery(usersQuery, [departmentId]),
      executeQuery(projectsQuery, [departmentId]),
      executeQuery(tasksQuery, [departmentId])
    ]);

    return {
      user_count: userRes[0]?.user_count || 0,
      project_count: projectRes[0]?.project_count || 0,
      task_count: taskRes[0]?.task_count || 0,
    };
  }
}

export default new DepartmentModel();
