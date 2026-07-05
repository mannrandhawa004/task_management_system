import { createAsyncThunk } from "@reduxjs/toolkit";

import * as taskService from "../services/task.service";

export const getProjectTasksThunk = createAsyncThunk(
  "task/getProjectTasks",

  async ({
    projectId,
    page = 1,
    limit = 10,
    status,
    priority,
    search,
  }, { rejectWithValue }) => {
    try {
      return await taskService.getProjectTasks(projectId,
        {
          page,
          limit,
          status,
          priority,
          search,
        });
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

export const getAllTasksThunk = createAsyncThunk(
  "task/getAllTasks",
  async ({
    page = 1,
    limit = 10,
    status,
    priority,
    search,
    projectId,
  } = {}, { rejectWithValue }) => {
    try {
      return await taskService.getAllTasks({
        page,
        limit,
        status,
        priority,
        search,
        projectId,
      });
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message
        || error.message
        || "Failed to fetch tasks"
      );
    }
  },
);

export const createTaskThunk = createAsyncThunk("task/createProjectTaskThunk", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    return await taskService.createProjectTask(projectId, data)
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message
      || error.message
      || "Something went wrong"
    );

  }
})

export const deleteTaskThunk =
  createAsyncThunk(
    "task/delete", async (
      taskId,
      { rejectWithValue }
    ) => {

    try {
      await taskService.deleteTask(taskId);
      return taskId;

    }
    catch (error) {
      return rejectWithValue(
        error.response?.data?.message
        || error.message
      );

    }
  });

export const assignTaskThunk =
  createAsyncThunk(
    "task/assignTask",
    async (
      {
        taskId,
        userIds,
      },
      {
        rejectWithValue
      }
    ) => {

      try {

        return await
          taskService.assignTask(
            taskId,
            userIds
          );

      }
      catch (error) {

        return rejectWithValue(
          error.response?.data?.message
        );

      }

    }
  );

export const getTaskByIdThunk = createAsyncThunk("task/get", async (taskId, { rejectWithValue }) => {
  try {
    return await taskService.getTaskById(taskId)
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message
    );
  }
})

export const myTaskThunk = createAsyncThunk('task/mytask', async (params, { rejectWithValue }) => {
  try {
    return await taskService.mytask(params);
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.message
    );
  }
})

export const updateTaskStatusThunk = createAsyncThunk(
  "task/updateStatus",
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const data = await taskService.updateTaskStatus(taskId, { status });
      return { taskId, data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE TASK PAYLOAD THUNK
export const updateTaskThunk = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, payload }, { rejectWithValue }) => {
    try {
      const data = await taskService.updateTask(taskId, { payload });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
)

