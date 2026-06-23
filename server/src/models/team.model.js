import { executeQuery } from "../utils/dbQuery.js";

class TeamModel {
  async create({ department_id, name, description, lead_id }) {
    const query = `
      INSERT INTO teams (department_id, name, description, lead_id)
      VALUES (?, ?, ?, ?)
    `;
    return await executeQuery(query, [
      department_id,
      name,
      description || null,
      lead_id || null,
    ]);
  }

  async getById(id) {
    const query = `
      SELECT t.*, d.name as department_name, u.name as lead_name, u.email as lead_email
      FROM teams t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN users u ON t.lead_id = u.id
      WHERE t.id = ?
      LIMIT 1
    `;
    const rows = await executeQuery(query, [id]);
    return rows[0] || null;
  }

  async getByNameAndDepartment(name, departmentId) {
    const query = `SELECT * FROM teams WHERE name = ? AND department_id = ? LIMIT 1`;
    const rows = await executeQuery(query, [name, departmentId]);
    return rows[0] || null;
  }

  async update(id, { department_id, name, description, lead_id }) {
    const query = `
      UPDATE teams
      SET department_id = ?, name = ?, description = ?, lead_id = ?
      WHERE id = ?
    `;
    return await executeQuery(query, [
      department_id,
      name,
      description || null,
      lead_id || null,
      id,
    ]);
  }

  async delete(id) {
    const query = `DELETE FROM teams WHERE id = ?`;
    return await executeQuery(query, [id]);
  }

  async getAll({ limit, offset, departmentId = null }) {
    let query = `
      SELECT t.*, d.name as department_name, u.name as lead_name,
        (SELECT COUNT(tm.id) FROM team_members tm WHERE tm.team_id = t.id) as member_count
      FROM teams t
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN users u ON t.lead_id = u.id
    `;
    const params = [];

    if (departmentId) {
      query += ` WHERE t.department_id = ? `;
      params.push(departmentId);
    }

    query += ` ORDER BY t.name ASC LIMIT ? OFFSET ? `;
    params.push(limit, offset);

    return await executeQuery(query, params);
  }

  async count(departmentId = null) {
    let query = `SELECT COUNT(id) as total FROM teams`;
    const params = [];

    if (departmentId) {
      query += ` WHERE department_id = ?`;
      params.push(departmentId);
    }

    const result = await executeQuery(query, params);
    return result[0]?.total || 0;
  }

  async addMember(teamId, userId) {
    const query = `
      INSERT INTO team_members (team_id, user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE team_id = team_id
    `;
    return await executeQuery(query, [teamId, userId]);
  }

  async removeMember(teamId, userId) {
    const query = `DELETE FROM team_members WHERE team_id = ? AND user_id = ?`;
    return await executeQuery(query, [teamId, userId]);
  }

  async getMembers(teamId) {
    const query = `
      SELECT tm.joined_at, u.id, u.name, u.email, u.avatar, r.name as role
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE tm.team_id = ?
      ORDER BY u.name ASC
    `;
    return await executeQuery(query, [teamId]);
  }

  async isMember(teamId, userId) {
    const query = `SELECT id FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1`;
    const rows = await executeQuery(query, [teamId, userId]);
    return !!rows[0];
  }

  async assignTeamToProject(projectId, teamId) {
    const query = `
      INSERT INTO project_teams (project_id, team_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE project_id = project_id
    `;
    return await executeQuery(query, [projectId, teamId]);
  }

  async removeTeamFromProject(projectId, teamId) {
    const query = `DELETE FROM project_teams WHERE project_id = ? AND team_id = ?`;
    return await executeQuery(query, [projectId, teamId]);
  }

  async getProjectTeams(projectId) {
    const query = `
      SELECT pt.assigned_at, t.id, t.name, t.description, d.name as department_name, u.name as lead_name
      FROM project_teams pt
      JOIN teams t ON pt.team_id = t.id
      JOIN departments d ON t.department_id = d.id
      LEFT JOIN users u ON t.lead_id = u.id
      WHERE pt.project_id = ?
      ORDER BY t.name ASC
    `;
    return await executeQuery(query, [projectId]);
  }

  async getTeamsByDepartment(departmentId) {
    const query = `SELECT id, name FROM teams WHERE department_id = ? ORDER BY name ASC`;
    return await executeQuery(query, [departmentId]);
  }
}

export default new TeamModel();
