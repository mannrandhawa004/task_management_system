import { api } from "@/lib/axios";

export const getProjectTasks = async (projectId, params = {}) => {
  const response = await api.get(`/task/project/${projectId}/tasks`, { params });
  return response.data.data;
};

export const getAllTasks = async (params = {}) => {
  const response = await api.get("/task/allTasks", { params });
  return response.data.data;
};

export const createProjectTask = async (projectId,
  data) => {
  const response = await api.post(`/task/${projectId}/tasks`, data);
  return response.data.data;
}

export const deleteTask = async (id) => {
  const response = await api.delete(`/task/delete/${id}`);
  return response.data.data
}

export const assignTask = async (taskId, userIds) => {
  const response =
    await api.post(
      `/task/${taskId}/assign`, userIds
    );
  return response.data.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/task/${taskId}`)
  return response.data

}
export const mytask = async (params) => {
  const response = await api.get(`/task/mytask`, { params });
  return response.data.data;
}

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/task/update/${taskId}/status`, status);
  return response.data.data
}

export const updateTask = async (taskId, { payload }) => {
  const response = await api.patch(`/task/update/${taskId}`, payload);
  return response.data.data
}

