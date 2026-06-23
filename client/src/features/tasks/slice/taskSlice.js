import { createSlice } from "@reduxjs/toolkit";
import {
  createTaskThunk,
  getAllTasksThunk,
  getProjectTasksThunk,
  deleteTaskThunk,
  assignTaskThunk,
  getTaskByIdThunk,
  myTaskThunk,
  updateTaskStatusThunk,
  updateTaskThunk
} from "../thunks/taskThunk";

const initialState = {
  tasks: [],
  currentTask: null,
  taskLoading: false,
  pagination: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.pagination = null;
      state.currentTask = null;
    },
    removeTask: (state, action) => {
      const deletedTaskId = Number(action.payload);
      state.tasks = state.tasks.filter(task => Number(task.id) !== deletedTaskId);

      if (Number(state.currentTask?.id) === deletedTaskId) {
        state.currentTask = null;
      }
    }
  },

  extraReducers: (builder) => {
    builder
      // GET PROJECT TASKS
      .addCase(getProjectTasksThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(getProjectTasksThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        const incomingTasks = action.payload?.data || [];
        const mergedTasks = [...state.tasks, ...incomingTasks];
        state.tasks = Array.from(
          new Map(mergedTasks.map(task => [task.id, task])).values()
        );
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getProjectTasksThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // GET ALL TASKS
      .addCase(getAllTasksThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(getAllTasksThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        state.tasks = action.payload?.data || [];
        state.pagination = action.payload?.pagination || null;
      })
      .addCase(getAllTasksThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // CREATE TASK
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        if (!Array.isArray(state.tasks)) state.tasks = [];
        const rawTask = action.payload?.data || action.payload;
        const newTask = {
          ...rawTask,
          title: rawTask?.title || "",
          description: rawTask?.description || "",
          priority: rawTask?.priority || "medium",
          due_date: rawTask?.due_date || null,
          assigned_users: rawTask?.assigned_users || [],
          created_by: rawTask?.created_by || null,
        };
        state.tasks.unshift(newTask);
      })

      // DELETE TASK
      .addCase(deleteTaskThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        taskSlice.caseReducers.removeTask(state, action);
      })
      .addCase(deleteTaskThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // ASSIGN TASK MEMBERS
      .addCase(assignTaskThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(assignTaskThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        const { taskId, assignedUsers } = action.payload || {};
        const task = state.tasks.find(t => t.id === Number(taskId));
        if (task) {
          task.assigned_users = [
            ...(task.assigned_users || []).filter(Boolean),
            ...(assignedUsers || []).filter(Boolean),
          ];
        }
      })
      .addCase(assignTaskThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // GET TASK BY ID
      .addCase(getTaskByIdThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(getTaskByIdThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        if (action.payload?.data && action.payload.data.length > 0) {
          state.currentTask = action.payload.data[0];
        } else if (action.payload?.data) {
          state.currentTask = action.payload.data;
        } else {
          state.currentTask = action.payload;
        }
      })
      .addCase(getTaskByIdThunk.rejected, (state) => {
        state.taskLoading = false;
        state.currentTask = null;
      })

      // MY TASKS
      .addCase(myTaskThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(myTaskThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(myTaskThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // UPDATE TASK STATUS
      .addCase(updateTaskStatusThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(updateTaskStatusThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        const { taskId, status } = action.meta.arg;

        const task = state.tasks.find(t => t.id === taskId);
        if (task) task.status = status;

        if (state.currentTask && state.currentTask.id === taskId) {
          state.currentTask.status = status;
        }
      })
      .addCase(updateTaskStatusThunk.rejected, (state) => {
        state.taskLoading = false;
      })

      // UPDATE TASK
      .addCase(updateTaskThunk.pending, (state) => {
        state.taskLoading = true;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.taskLoading = false;
        const updatedTask = action.payload?.data || action.payload;
        if (!updatedTask?.id) return;

        state.tasks = state.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t);

        if (state.currentTask && state.currentTask.id === updatedTask.id) {
          state.currentTask = { ...state.currentTask, ...updatedTask };
        }
      })
      .addCase(updateTaskThunk.rejected, (state) => {
        state.taskLoading = false;
      });
  },
});

export const { clearCurrentTask, clearTasks, removeTask } = taskSlice.actions;
export default taskSlice.reducer;
