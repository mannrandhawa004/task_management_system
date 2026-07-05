import { executeQuery } from "../utils/dbQuery.js";

class AuthModel {
  async registerUserQuery({ name, email, password, role_id, department_id, avatar }) {
    const params = [name, email, password, role_id, department_id || null, avatar || null];
    const insertUserQuery = `INSERT INTO users(name, email, password, role_id, department_id, avatar) VALUES (?, ?, ?, ?, ?, ?)`;

    const result = await executeQuery(insertUserQuery, params);
    return result;
  }

  async getUserByEmail(email) {
    const query = `SELECT
      u.id,
      u.name,
      u.email,
      u.password,
      u.status,
      u.avatar,
      u.department_id,
      u.two_factor_enabled,
      u.two_factor_secret,
      d.name AS department_name,
      r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE email = ?`;
    const result = await executeQuery(query, [email]);

    return result[0];
  }

  async saveRefreshToken(userId, token, device, ip, expiresAt) {
    const query = `
        INSERT INTO refresh_tokens (user_id, token, device, ip_address, expires_at)
        VALUES (?, ?, ?, ?, ?)
    `;

    return await executeQuery(query, [
      userId,
      token,
      device ?? null,
      ip ?? null,
      expiresAt,
    ]);
  }

  async deleteAllUserTokens(userId) {
    const query = `DELETE FROM refresh_tokens WHERE user_id = ?`;
    return await executeQuery(query, [userId]);
  }

  async findRefreshToken(token) {
    const query = `SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1`;
    return await executeQuery(query, [token]);
  }

  async deleteTokenByDevice(userId, device, ip) {
    const query = `
    DELETE FROM refresh_tokens
    WHERE user_id = ?
    AND device = ?
    AND ip_address = ?
  
  `;

    return await executeQuery(query, [userId, device, ip]);
  }

  async deleteRefreshToken(token) {
    const query = `DELETE FROM refresh_tokens WHERE token = ?`;
    return await executeQuery(query, [token]);
  }

  async profile(id) {
    const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.status,
      u.avatar,
      u.employee_id,
      u.phone,
      u.team_id,
      u.created_at,
      u.department_id,
      u.two_factor_enabled,
      u.two_factor_secret,
      d.name AS department_name,
      r.id AS role_id,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
    LIMIT 1
  `;

    const result = await executeQuery(query, [id]);

    return result[0];
  }

  async getAllUsers(limit, offset) {
    const query = `
    SELECT
      u.id,
      u.name,
      u.email,
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
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

    return await executeQuery(query, [limit, offset]);
  }

  async countUsers() {
    const query = `SELECT COUNT(id) AS total FROM users `;

    const result = await executeQuery(query, []);
    return result[0].total;
  }

  async countUserSession(userId) {
    const query = `
        SELECT COUNT(*) AS total FROM refresh_tokens 
        WHERE user_id = ?
        AND expires_at > NOW()
    `;
    const result = await executeQuery(query, [userId]);
    return result[0].total;
  }

  async clearExpiredSessions(userId) {
    const query = `
        DELETE FROM refresh_tokens
        WHERE user_id = ?
        AND expires_at < NOW()
    `;

    return await executeQuery(query, [userId]);
  }

  async deleteOldestSession(userId) {
    const query = `
        DELETE FROM refresh_tokens
        WHERE id = (
            SELECT id FROM (
                SELECT id
                FROM refresh_tokens
                WHERE user_id = ?
                ORDER BY created_at ASC
                LIMIT 1
            ) temp
        )
    `;

    return await executeQuery(query, [userId]);
  }

  async getUserById(userId) {
    const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.status,
      u.department_id,
      u.two_factor_enabled,
      u.two_factor_secret,
      d.name AS department_name,
      r.id AS role_id,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.id = ?
    LIMIT 1
  `;

    const result = await executeQuery(query, [userId]);

    return result[0];
  }

  async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET password = ?
      WHERE id = ?
    `;

    return await executeQuery(query, [hashedPassword, userId]);
  }

  async getUserPermissions(userId) {
    const query = `
    SELECT DISTINCT
  p.name AS permission
FROM project_members pm
JOIN roles r
  ON r.id = pm.role_id
JOIN role_permissions rp
  ON rp.role_id = r.id
JOIN permissions p
  ON p.id = rp.permission_id
WHERE pm.user_id = ?
  `;

    return await executeQuery(query, [userId]);
  }

  async getRoleById(roleId) {
    const query = `
    SELECT *
    FROM roles
    WHERE id = ?
    LIMIT 1
  `;

    const result = await executeQuery(query, [roleId]);
    return result[0];
  }

  async getExistingUsers(userIds) {
    const placeholders = userIds.map(() => "?").join(",");
    const query = `
    SELECT id
    FROM users
    WHERE id IN (${placeholders})
  `;
    return await executeQuery(query, userIds);
  }


  async changeUserStatus(id, status) {
    const updateQuery = `UPDATE users SET status = ? WHERE id = ?`;
    await executeQuery(updateQuery, [status, id]);

    const selectQuery = `SELECT id, name, email, status FROM users WHERE id = ?`;
    const rows = await executeQuery(selectQuery, [id]);
    return rows[0] || null;
  }

  async updateUserTwoFactor(userId, secret, enabled) {
    const query = `UPDATE users SET two_factor_secret = ?, two_factor_enabled = ? WHERE id = ?`;
    return await executeQuery(query, [secret, enabled, userId]);
  }
}

export default new AuthModel();
