import { api } from "@/lib/axios";

export const createDepartment = async (data) => {
  const response = await api.post("/departments/create", data);
  return response.data.data;
};

export const updateDepartment = async ({ id, data }) => {
  const response = await api.patch(`/departments/${id}`, data);
  return response.data.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/delete/${id}`);
  return response.data.data;
};

export const getDepartments = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get(`/departments?page=${page}&limit=${limit}`);
  return response.data.data;
};

export const getDepartmentDetails = async (id) => {
  const response = await api.get(`/departments/${id}`);
  return response.data.data;
};

export const getDepartmentUsers = async (id) => {
  const response = await api.get(`/departments/${id}/users`);
  return response.data.data;
};

export const getDepartmentStats = async (id) => {
  const response = await api.get(`/departments/${id}/stats`);
  return response.data.data;
};
