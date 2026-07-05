import { api } from "@/lib/axios";

export const createTeam = async (data) => {
  const response = await api.post("/teams/create", data);
  return response.data.data;
};

export const updateTeam = async ({ id, data }) => {
  const response = await api.patch(`/teams/${id}`, data);
  return response.data.data;
};

export const deleteTeam = async (id) => {
  const response = await api.delete(`/teams/delete/${id}`);
  return response.data.data;
};

export const getTeams = async ({ page = 1, limit = 10, departmentId = "" } = {}) => {
  const response = await api.get(`/teams?page=${page}&limit=${limit}&departmentId=${departmentId}`);
  return response.data.data;
};

export const getMyTeams = async () => {
  const response = await api.get("/teams/my-teams");
  return response.data.data;
};

export const getTeamDetails = async (id) => {
  const response = await api.get(`/teams/${id}`);
  return response.data.data;
};

export const addTeamMember = async ({ teamId, userId }) => {
  const response = await api.post(`/teams/${teamId}/members`, { userId });
  return response.data.data;
};

export const removeTeamMember = async ({ teamId, userId }) => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`);
  return response.data.data;
};

export const getTeamMembers = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/members`);
  return response.data.data;
};

export const assignTeamToProject = async ({ projectId, teamId }) => {
  const response = await api.post("/teams/assign-project", { projectId, teamId });
  return response.data.data;
};

export const removeTeamFromProject = async ({ projectId, teamId }) => {
  const response = await api.delete(`/teams/project/${projectId}/team/${teamId}`);
  return response.data.data;
};

export const getProjectTeams = async (projectId) => {
  const response = await api.get(`/teams/project/${projectId}`);
  return response.data.data;
};
