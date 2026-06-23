import { executeQuery } from "../utils/dbQuery.js";

class ProjectModel {
  // query for creating project
  async createProject({ name, description, createdBy }) {
    const query = `
            INSERT INTO projects (
                name,
                description,
                created_by
            )
            VALUES (?, ?, ?)
        `;

    return await executeQuery(query, [name, description, createdBy]);
  }
  // get project by id
  async getProjectById(projectId) {
    const query = `
            SELECT
                p.id,
                p.name,
                p.description,
                p.status,
                p.created_at,
                u.id AS creator_id,
                r.name as role,
                u.name AS creator_name,
                u.email AS creator_email
            FROM projects p
            JOIN users u
            ON p.created_by = u.id

            LEFT JOIN roles r
            ON u.role_id = r.id
            WHERE p.id = ?
            LIMIT 1
        `;

    const result = await executeQuery(query, [projectId]);

    return result[0];
  }

  async getIndividualProjectById({ userId, projectId }) {
    const query = `
    SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,

        u.id AS creator_id,
        u.name AS creator_name,
        u.email AS creator_email,

        creator_role.name AS creator_role,

        pm.role_id AS project_role_id,
        project_role.name AS role,
        
        /* CORRELATED SUBQUERY TO GET TOTAL TASKS COUNT */
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS tasks_count

    FROM projects p

    JOIN users u
      ON p.created_by = u.id

    LEFT JOIN roles creator_role
      ON u.role_id = creator_role.id

    LEFT JOIN project_members pm
      ON pm.project_id = p.id
      AND pm.user_id = ?

    LEFT JOIN roles project_role
      ON pm.role_id = project_role.id

    WHERE p.id = ?
    LIMIT 1
  `;

    const res = await executeQuery(query, [userId, projectId]);
    return res[0];
  }

  // get total count of all projects
  async getTotalProjectsCount() {
    const query = `SELECT COUNT(*) as total FROM projects`;
    const result = await executeQuery(query);
    return result[0].total;
  }

  // listing all the projects
  async getAllProjects({ limit, offset }) {
    const query = `
      SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.created_at,
          p.updated_at,

          u.id AS creator_id,
          u.name AS creator_name,
          u.email AS creator_email,

          NULL AS project_role_id,
          'admin' AS role,

          (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS tasks_count

      FROM projects p

      JOIN users u
          ON p.created_by = u.id

      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    return executeQuery(query, [limit, offset]);
  }

  // get total count of user projects
  async getTotalUserProjectsCount(userId) {
    const query = `
      SELECT COUNT(*) as total
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      WHERE pm.user_id = ?
    `;
    const result = await executeQuery(query, [userId]);
    return result[0].total;
  }
  // updating the project
  async updateProject({ projectId, name, description, status }) {
    let fields = [];
    let values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }

    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided for update");
    }

    const query = `
    UPDATE projects
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

    values.push(projectId);
    return await executeQuery(query, values);
  }

  // deleting the project
  async deleteProject(projectId) {
    const query = `
            DELETE FROM projects
            WHERE id = ?
        `;

    return await executeQuery(query, [projectId]);
  }
  // adding members in the project
  async addMember({ projectId, userId, roleId }) {
    const query = `
  
    INSERT INTO project_members (
      project_id,
      user_id,
      role_id
    )

    VALUES (?, ?, ?)
  `;

    return await executeQuery(query, [projectId, userId, roleId]);
  }
  // listing all the member belong to a particular project.
  async getProjectMember(projectId, userId) {
    const query = `
  
    SELECT EXISTS(
      SELECT 1
      FROM project_members
      WHERE project_id = ?
      AND user_id = ?
    ) AS isMember
  `;

    const result = await executeQuery(query, [projectId, userId]);

    return result[0];
  }
  // fetching the individual data of member belong to a particular project
  async getProjectMemberData(projectId, userId) {
    const query = `
    SELECT *
    FROM project_members
    WHERE project_id = ?
    AND user_id = ?
    LIMIT 1
  `;

    const result = await executeQuery(query, [projectId, userId]);
    return result[0];
  }
  // listing member details along with the project.
  async getProjectMembers(projectId) {
    const query = `
            SELECT 
              pm.id,
              r.name as role_name,
              pm.joined_at,
            
              u.id as member_id,
              u.name as member_name,
              u.email,
              u.status
            
            FROM project_members pm
            JOIN users u 
            ON pm.user_id = u.id

            LEFT JOIN roles r
            ON pm.role_id = r.id
            WHERE pm.project_id = ?
            ORDER BY pm.joined_at DESC`;

    return await executeQuery(query, [projectId]);
  }
  // deleting or removing the member from project
  async deleteMember(projectId, userId) {
    const query = `DELETE FROM project_members 
                    WHERE project_id = ?
                    AND user_id = ?`;

    const result = await executeQuery(query, [projectId, userId]);
    return result;
  }
  // fetching the roles of member
  async getMemberRole(projectId, userId) {
    const query = `
            SELECT r.name AS role 
            FROM project_members pm
            JOIN roles r ON pm.role_id = r.id
            WHERE pm.project_id = ? AND pm.user_id = ?
            LIMIT 1`;

    const result = await executeQuery(query, [projectId, userId]);
    return result[0];
  }

  async getValidProjectMembers(projectId, userIds) {
    const placeholders = userIds.map(() => "?").join(",");
    const query = `SELECT user_id 
                   FROM project_members
                   WHERE project_id = ?
                   AND user_id IN (${placeholders})`;
    return await executeQuery(query, [projectId, ...userIds]);
  }

  async getProjectMembersIds(projectId) {
    const query = `
    SELECT user_id
    FROM project_members
    WHERE project_id = ?
  `;

    return await executeQuery(query, [projectId]);
  }

  // fetch the projects which user belongs
  async getUserProjects(userId, { limit, offset }) {
    const query = `
    SELECT
        p.id,
        p.name,
        p.description,
        p.status,
        p.created_at,
        p.updated_at,

        u.id AS creator_id,
        u.name AS creator_name,
        u.email AS creator_email,

        pm.role_id AS project_role_id,
        r.name AS role

    FROM projects p

    JOIN project_members pm
        ON pm.project_id = p.id

    JOIN users u
        ON p.created_by = u.id

    JOIN roles r
        ON pm.role_id = r.id

    WHERE pm.user_id = ?

    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
`;

    return await executeQuery(query, [userId, limit, offset]);
  }

  // Check if user has access to a project (as a member)
  async hasUserAccess(projectId, userId) {
    const query = `
    SELECT EXISTS(
      SELECT 1
      FROM project_members
      WHERE project_id = ?
      AND user_id = ?
    ) AS hasAccess
  `;

    const result = await executeQuery(query, [projectId, userId]);
    return result[0]?.hasAccess === 1 || result[0]?.hasAccess === true;
  }
}

export default new ProjectModel();
