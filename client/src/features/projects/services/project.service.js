import { api } from "@/lib/axios";

export const getProjects = async ({ page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;
  const response = await api.get("/project", {
    params: {
      page,
      limit,
      offset,
    },
  });
  return response.data.data;
};

export const getProjectDetails = async (id) => {
  const response = await api.get(`/project/details/${id}`);
  return response.data.data;
};

export const createProject = async (data) => {
  const response = await api.post("/project/create", data);

  return response.data.data;
};

export const updateProject = async (id, data) => {
  const response = await api.patch(`/project/${id}`, data);

  return response.data.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/project/delete/${id}`);

  return response.data.data;
};

export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/project/${projectId}/members`);
  return response.data.data;
};

export const addProjectMember = async (projectId, data) => {
  const response = await api.post(`/project/${projectId}/members`, data);
  return response.data.data;
};

export const removeProjectMember = async (projectId, userId) => {
  const response = await api.delete(`/project/${projectId}/members/${userId}`);
  return response.data.data;
};
