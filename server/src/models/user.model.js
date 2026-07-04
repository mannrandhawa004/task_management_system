import { executeQuery } from "../utils/dbQuery.js";

class UserModel {
  async getAllUsers({ limit, offset, filters, requestingUser }) {
    const params = [];
    const countParams = [];

    let visibilityQuery = " WHERE 1=1 ";
    const userRole = requestingUser.role ? requestingUser.role.toLowerCase() : "";

    // 1. Enforce strict visibility restrictions at query layer
    if (userRole === "super_admin" || userRole === "admin" || userRole === "hr") {
      // No visibility restrictions — HR needs full employee list access for onboarding/offboarding
    } else if (userRole === "dept_head") {
      visibilityQuery += " AND u.department_id = ? ";
      params.push(requestingUser.department_id || null);
      countParams.push(requestingUser.department_id || null);
    } else if (userRole === "team_lead") {
      visibilityQuery += ` AND (u.id = ? 
        OR u.team_id IN (SELECT id FROM teams WHERE lead_id = ?) 
        OR u.id IN (SELECT user_id FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE lead_id = ?))) `;
      params.push(requestingUser.id, requestingUser.id, requestingUser.id);
      countParams.push(requestingUser.id, requestingUser.id, requestingUser.id);
    } else if (userRole === "project_manager") {
      visibilityQuery += ` AND (u.id = ? 
        OR u.id IN (
          SELECT DISTINCT pm.user_id 
          FROM project_members pm 
          WHERE pm.project_id IN (
            SELECT p.id 
            FROM projects p 
            LEFT JOIN project_members pm2 ON pm2.project_id = p.id AND pm2.user_id = ?
            WHERE p.created_by = ? OR pm2.role_id IN (1)
          )
        )) `;
      params.push(requestingUser.id, requestingUser.id, requestingUser.id);
      countParams.push(requestingUser.id, requestingUser.id, requestingUser.id);
    } else {
      // Standard employee/intern/senior_employee can only see themselves
      visibilityQuery += " AND u.id = ? ";
      params.push(requestingUser.id);
      countParams.push(requestingUser.id);
    }

    // 2. Append optional advanced filters
    let filterQuery = "";
    if (filters.departmentId) {
      filterQuery += " AND u.department_id = ? ";
      params.push(Number(filters.departmentId));
      countParams.push(Number(filters.departmentId));
    }
    if (filters.roleId) {
      filterQuery += " AND u.role_id = ? ";
      params.push(Number(filters.roleId));
      countParams.push(Number(filters.roleId));
    }
    if (filters.teamId) {
      filterQuery += " AND u.team_id = ? ";
      params.push(Number(filters.teamId));
      countParams.push(Number(filters.teamId));
    }
    if (filters.status) {
      filterQuery += " AND u.status = ? ";
      params.push(filters.status);
      countParams.push(filters.status);
    }
    if (filters.managerId) {
      filterQuery += " AND u.reporting_manager_id = ? ";
      params.push(Number(filters.managerId));
      countParams.push(Number(filters.managerId));
    }
    if (filters.employeeId) {
      filterQuery += " AND u.employee_id = ? ";
      params.push(filters.employeeId);
      countParams.push(filters.employeeId);
    }
    if (filters.attendanceStatus) {
      if (filters.attendanceStatus === "absent") {
        filterQuery += " AND (a.status = 'absent' OR a.status IS NULL) ";
      } else {
        filterQuery += " AND a.status = ? ";
        params.push(filters.attendanceStatus);
        countParams.push(filters.attendanceStatus);
      }
    }
    if (filters.name) {
      filterQuery += " AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?) ";
      const likeParam = `%${filters.name}%`;
      params.push(likeParam, likeParam, likeParam, likeParam, likeParam);
      countParams.push(likeParam, likeParam, likeParam, likeParam, likeParam);
    }

    const selectQuery = `
      SELECT
        u.id,
        u.name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.employee_id,
        u.dob,
        u.reporting_manager_id,
        m.name AS manager_name,
        u.team_id,
        t.name AS team_name,
        u.status,
        u.avatar,
        u.created_at,
        u.department_id,
        d.name AS department_name,
        r.id AS role_id,
        r.name AS role,
        a.status AS today_attendance_status
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.reporting_manager_id = m.id
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN attendance a ON a.user_id = u.id AND a.date = CURRENT_DATE()
      ${visibilityQuery}
      ${filterQuery}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      LEFT JOIN attendance a ON a.user_id = u.id AND a.date = CURRENT_DATE()
      ${visibilityQuery}
      ${filterQuery}
    `;

    const [rows, countResult] = await Promise.all([
      executeQuery(selectQuery, params),
      executeQuery(countQuery, countParams),
    ]);

    return {
      rows,
      total: countResult[0]?.total || 0,
    };
  }

  async getUserById(id) {
    const query = `
      SELECT
        u.id,
        u.name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.employee_id,
        u.dob,
        u.reporting_manager_id,
        m.name AS manager_name,
        u.team_id,
        t.name AS team_name,
        u.status,
        u.avatar,
        u.created_at,
        u.department_id,
        d.name AS department_name,
        r.id AS role_id,
        r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN users m ON u.reporting_manager_id = m.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const rows = await executeQuery(query, [id]);
    return rows[0];
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ? LIMIT 1`;
    const rows = await executeQuery(query, [email]);
    return rows[0];
  }

  async getUserByEmployeeId(employeeId) {
    const query = `SELECT * FROM users WHERE employee_id = ? LIMIT 1`;
    const rows = await executeQuery(query, [employeeId]);
    return rows[0];
  }

  async getRoleById(roleId) {
    const query = `SELECT * FROM roles WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [roleId]);
    return rows[0];
  }

  async getDepartmentById(deptId) {
    const query = `SELECT * FROM departments WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [deptId]);
    return rows[0];
  }

  async getTeamById(teamId) {
    const query = `SELECT * FROM teams WHERE id = ? LIMIT 1`;
    const rows = await executeQuery(query, [teamId]);
    return rows[0];
  }

  async getAllRoles() {
    const query = `SELECT id, name FROM roles ORDER BY id ASC`;
    return await executeQuery(query, []);
  }

  async createUser({
    first_name,
    last_name,
    name,
    email,
    password,
    role_id,
    department_id,
    phone,
    employee_id,
    reporting_manager_id,
    team_id,
    avatar,
    dob,
  }) {
    const query = `
      INSERT INTO users (
        name, first_name, last_name, email, password, role_id, department_id,
        phone, employee_id, reporting_manager_id, team_id, avatar, dob, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `;
    const params = [
      name,
      first_name,
      last_name,
      email,
      password,
      role_id,
      department_id,
      phone || null,
      employee_id,
      reporting_manager_id || null,
      team_id || null,
      avatar || null,
      dob || null,
    ];
    const result = await executeQuery(query, params);
    return result;
  }

  async updateUser(id, {
    first_name,
    last_name,
    name,
    email,
    role_id,
    department_id,
    phone,
    employee_id,
    reporting_manager_id,
    team_id,
    status,
    avatar,
    dob,
  }) {
    let query = `
      UPDATE users SET
        name = ?,
        first_name = ?,
        last_name = ?,
        email = ?,
        role_id = ?,
        department_id = ?,
        phone = ?,
        employee_id = ?,
        reporting_manager_id = ?,
        team_id = ?,
        status = ?
    `;
    const params = [
      name,
      first_name,
      last_name,
      email,
      role_id,
      department_id,
      phone || null,
      employee_id,
      reporting_manager_id || null,
      team_id || null,
      status,
    ];

    if (dob !== undefined) {
      query += ", dob = ? ";
      params.push(dob || null);
    }

    if (avatar) {
      query += ", avatar = ? ";
      params.push(avatar);
    }

    query += " WHERE id = ? ";
    params.push(id);

    return await executeQuery(query, params);
  }

  async deleteUser(id) {
    const query = `DELETE FROM users WHERE id = ?`;
    return await executeQuery(query, [id]);
  }

  async getTodayBirthdays({ requestingUser }) {
    const params = [];
    const visibilityQuery = " WHERE u.status = 'active' AND u.dob IS NOT NULL ";

    const dateCondition = `
      AND (
        (MONTH(u.dob) = MONTH(CURRENT_DATE()) AND DAY(u.dob) = DAY(CURRENT_DATE()))
        OR (MONTH(CURRENT_DATE()) = 2 AND DAY(CURRENT_DATE()) = 28 AND DAY(LAST_DAY(CURRENT_DATE())) = 28 AND MONTH(u.dob) = 2 AND DAY(u.dob) = 29)
      )
    `;

    const query = `
      SELECT
        u.id,
        u.name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.employee_id,
        u.dob,
        u.avatar,
        u.department_id,
        d.name AS department_name,
        u.team_id,
        t.name AS team_name,
        r.name AS role,
        u.reporting_manager_id,
        m.name AS manager_name
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN users m ON u.reporting_manager_id = m.id
      ${visibilityQuery}
      ${dateCondition}
      ORDER BY u.name ASC
    `;

    return await executeQuery(query, params);
  }
}

export default new UserModel();
