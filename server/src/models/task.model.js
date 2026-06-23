import { executeQuery } from "../utils/dbQuery.js";

class TaskModel {
  async createTask(data, connection) {
    const query = `
    INSERT INTO tasks(
      project_id,
      title,
      description,
      created_by,
      priority,
      due_date
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    const result = await executeQuery(
      query,
      [
        data.projectId,
        data.title,
        data.description ?? null,
        data.created_by,
        data.priority || "medium",
        data.due_date || null,
      ]
    );

    return result.insertId;
  }

  async assignTaskToUsers(taskId, userIds, connection) {
    const query = `
    INSERT INTO task_assignees (
      task_id,
      user_id
    )
    VALUES (?, ?)
  `;

    for (const userId of userIds) {
      await executeQuery(query, [taskId, userId], connection);
    }
  }

  async getTaskById(taskId) {
    const query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,

      JSON_OBJECT(
        'id', p.id,
        'name', p.name
      ) AS project,

      JSON_OBJECT(
        'id', u2.id,
        'name', u2.name
      ) AS created_by,

      JSON_ARRAYAGG(
        CASE
          WHEN u1.id IS NOT NULL THEN
            JSON_OBJECT(
              'id', u1.id,
              'name', u1.name
            )
        END
      ) AS assigned_users

    FROM tasks t

    JOIN projects p
    ON p.id = t.project_id

    LEFT JOIN users u2
    ON u2.id = t.created_by

    LEFT JOIN task_assignees ta
    ON ta.task_id = t.id

    LEFT JOIN users u1
    ON u1.id = ta.user_id

    WHERE t.id = ?

    GROUP BY t.id
  `;

    const result = await executeQuery(query, [taskId]);


    if (!result[0]) {
      return null;
    }

    const task = result[0];


    task.project = JSON.parse(task.project);
    task.created_by = JSON.parse(task.created_by);
    task.assigned_users = JSON.parse(task.assigned_users);

    return task;
  }

  async getProjectAllTasks({ projectId, filters, limit, offset }) {
    const conditions = ["t.project_id = ?"];
    const values = [projectId];

    if (filters.status) {
      conditions.push("t.status = ?");
      values.push(filters.status);
    }

    if (filters.priority) {
      conditions.push("t.priority = ?");
      values.push(filters.priority);
    }

    if (filters.search) {
      conditions.push(`(
      t.title LIKE ?
      OR t.description LIKE ?
    )`);

      values.push(`%${filters.search}%`);
      values.push(`%${filters.search}%`);
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

      JSON_OBJECT(
        'id', p.id,
        'name', p.name
      ) AS project,

      JSON_OBJECT(
        'id', u2.id,
        'name', u2.name
      ) AS created_by,

      JSON_ARRAYAGG(
        CASE
          WHEN u1.id IS NOT NULL THEN
            JSON_OBJECT(
              'id', u1.id,
              'name', u1.name
            )
        END
      ) AS assigned_users

    FROM tasks t

    JOIN projects p
    ON p.id = t.project_id

    LEFT JOIN users u2
    ON u2.id = t.created_by

    LEFT JOIN task_assignees ta
    ON ta.task_id = t.id

    LEFT JOIN users u1
    ON u1.id = ta.user_id

    WHERE ${conditions.join(" AND ")}

    GROUP BY t.id

    ORDER BY t.created_at DESC

    LIMIT ? OFFSET ?
  `;

      values.push(limit, offset);

      return await executeQuery(query, values);
    }

  async countProjectTasks({ projectId, filters }) {
      const conditions = ["project_id = ?"];
      const values = [projectId];

      if (filters.status) {
        conditions.push("status = ?");
        values.push(filters.status);
      }

      if (filters.priority) {
        conditions.push("priority = ?");
        values.push(filters.priority);
      }

      if (filters.search) {
        conditions.push("(title LIKE ? OR description LIKE ?)");
        values.push(`%${filters.search}%`);
        values.push(`%${filters.search}%`);
      }

      const query = `
    SELECT COUNT(*) AS total
    FROM tasks
    WHERE ${conditions.join(" AND ")}
  `;

      const result = await executeQuery(query, values);

      return result[0].total;
    }

  async getAllTasks({ filters, limit, offset }) {
      const conditions = [];
      const values = [];

      if (filters.status) {
        conditions.push("t.status = ?");
        values.push(filters.status);
      }

      if (filters.priority) {
        conditions.push("t.priority = ?");
        values.push(filters.priority);
      }

      if (filters.projectId) {
        conditions.push("t.project_id = ?");
        values.push(filters.projectId);
      }

      if (filters.search) {
        conditions.push(`(
        t.title LIKE ?
        OR t.description LIKE ?
        OR p.name LIKE ?
      )`);

        values.push(`%${filters.search}%`);
        values.push(`%${filters.search}%`);
        values.push(`%${filters.search}%`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,

      JSON_OBJECT(
        'id', p.id,
        'name', p.name
      ) AS project,

      JSON_OBJECT(
        'id', u2.id,
        'name', u2.name
      ) AS created_by,

      JSON_ARRAYAGG(
        CASE
          WHEN u1.id IS NOT NULL THEN
            JSON_OBJECT(
              'id', u1.id,
              'name', u1.name
            )
        END
      ) AS assigned_users

    FROM tasks t

    JOIN projects p
    ON p.id = t.project_id

    LEFT JOIN users u2
    ON u2.id = t.created_by

    LEFT JOIN task_assignees ta
    ON ta.task_id = t.id

    LEFT JOIN users u1
    ON u1.id = ta.user_id

    ${whereClause}

    GROUP BY t.id

    ORDER BY t.created_at DESC

    LIMIT ? OFFSET ?
  `;

      values.push(limit, offset);

      return await executeQuery(query, values);
    }

  async countAllTasks({ filters }) {
      const conditions = [];
      const values = [];

      if (filters.status) {
        conditions.push("t.status = ?");
        values.push(filters.status);
      }

      if (filters.priority) {
        conditions.push("t.priority = ?");
        values.push(filters.priority);
      }

      if (filters.projectId) {
        conditions.push("t.project_id = ?");
        values.push(filters.projectId);
      }

      if (filters.search) {
        conditions.push(`(
        t.title LIKE ?
        OR t.description LIKE ?
        OR p.name LIKE ?
      )`);

        values.push(`%${filters.search}%`);
        values.push(`%${filters.search}%`);
        values.push(`%${filters.search}%`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const query = `
    SELECT COUNT(*) AS total
    FROM tasks t

    JOIN projects p
    ON p.id = t.project_id

    ${whereClause}
  `;

      const result = await executeQuery(query, values);

      return result[0].total;
    }

  async updateTask({ taskId, title, description, status, priority, due_date }) {
      const fields = [];
      const values = [];

      if (title !== undefined) {
        fields.push("title = ?");
        values.push(title);
      }

      if (description !== undefined) {
        fields.push("description = ?");
        values.push(description);
      }

      if (status !== undefined) {
        fields.push("status = ?");
        values.push(status);
      }

      if (priority !== undefined) {
        fields.push("priority = ?");
        values.push(priority);
      }

      if (due_date !== undefined) {
        fields.push("due_date = ?");
        values.push(due_date);
      }

      if (fields.length === 0) {
        return false;
      }

      const query = `
    UPDATE tasks
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

      values.push(taskId);
      return await executeQuery(query, values);
    }

  async deleteTask(taskId) {
      const query = `DELETE FROM tasks WHERE id = ?`;
      return await executeQuery(query, [taskId]);
    }

  async findTaskById(taskId) {
      const query = `
      SELECT EXISTS(
         SELECT 1
         FROM tasks
         WHERE id = ?
      ) AS isTaskExists
   `;
      return executeQuery(query, [taskId]);
    }

  async getAssignedMember(taskId, userId) {
      const query = `
      SELECT EXISTS(
          SELECT 1 
          FROM task_assignees
          WHERE task_id = ?
          AND user_id =?
      ) AS isAssigned`;

      const result = await executeQuery(query, [taskId, userId]);
      return result[0];
    }

  async updateStatus(taskId, status) {
      const query = `
    UPDATE tasks
    SET status = ?
    WHERE id = ?
  `;

      const result = await executeQuery(query, [status, taskId]);
      return result.affectedRows > 0;
    }

  async getMyTasks(userId) {
      const query = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,

      JSON_OBJECT(
        'id', p.id,
        'name', p.name
      ) AS project,

      JSON_OBJECT(
        'id', u2.id,
        'name', u2.name
      ) AS created_by,

      JSON_ARRAYAGG(
        CASE
          WHEN u1.id IS NOT NULL THEN
            JSON_OBJECT(
              'id', u1.id,
              'name', u1.name
            )
        END
      ) AS assigned_users

    FROM tasks t

    -- 1. All JOIN operations must execute first
    JOIN projects p
    ON p.id = t.project_id

    LEFT JOIN users u2
    ON u2.id = t.created_by

    LEFT JOIN task_assignees ta
    ON ta.task_id = t.id

    LEFT JOIN users u1
    ON u1.id = ta.user_id

    -- 2. The WHERE clause filters down the joined dataset
    WHERE t.id IN (
      SELECT task_id 
      FROM task_assignees 
      WHERE user_id = ?
    )

    -- 3. Group and sort the final result set
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

      const tasks = await executeQuery(query, [userId]);
      return tasks.map((task) => ({
        ...task,
        project: typeof task.project === 'string' ? JSON.parse(task.project) : task.project,
        created_by: typeof task.created_by === 'string' ? JSON.parse(task.created_by) : task.created_by,
        assigned_users: typeof task.assigned_users === 'string' ? JSON.parse(task.assigned_users) : task.assigned_users,
      }));
    }

  async getTaskProject(taskId) {
      const query = `
    SELECT project_id
    FROM tasks
    WHERE id = ?
    LIMIT 1
  `;

      const result = await executeQuery(query, [taskId]);

      return result[0];
    }

  async findTaskById(taskId) {
      const query = `
          SELECT
          id,
          project_id,
          status
        FROM tasks
        WHERE id = ?
        `
      const result = await executeQuery(query, [taskId])
      return result;

    }

  async checkAssignment(
      taskId,
      userIds
    ) {

      if (!userIds?.length)
        return [];

      const placeholders =
        userIds
          .map(() => "?")
          .join(",");

      const query = `
    SELECT user_id
    FROM task_assignees
    WHERE task_id = ?
    AND user_id IN (${placeholders})
  `;

      return await executeQuery(
        query,
        [
          taskId,
          ...userIds
        ]
      );
    }

  async assignTask(taskId, userIds) {

      const placeholders =
        userIds
          .map(() => "(?, ?)")
          .join(",");

      const values =
        userIds.flatMap(
          userId => [
            taskId,
            userId
          ]
        );

      const insertQuery = `
    INSERT INTO task_assignees
    (
      task_id,
      user_id
    )
    VALUES ${placeholders}
  `;

      return await executeQuery(
        insertQuery,
        values
      );
    }
  }

export default new TaskModel();
