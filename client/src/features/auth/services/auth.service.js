import { api } from "@/lib/axios";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.patch("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({ page, limit });
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      queryParams.append(key, value);
    }
  });
  const response = await api.get(`/users?${queryParams.toString()}`);
  return response.data.data;
};

export const getIndividualUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data.data;
};

export const changeStatus = async ({ userId, status }) => {
  console.log("Updating User ID:", userId, "to Status:", status);
  const response = await api.patch(`/auth/changeStatus/${userId}`, { status });
  return response.data.data;
};

export const createUser = async (formData) => {
  const response = await api.post("/users", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const updateUser = async (userId, formData) => {
  const response = await api.put(`/users/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data.data;
};

export const getRoles = async () => {
  const response = await api.get("/users/roles");
  return response.data.data;
};

export const generate2FA = async () => {
  const response = await api.post("/auth/2fa/generate");
  return response.data.data;
};

export const verify2FASetup = async (secret, token) => {
  const response = await api.post("/auth/2fa/verify-setup", { secret, token });
  return response.data.data;
};

export const disable2FA = async (password) => {
  const response = await api.post("/auth/2fa/disable", { password });
  return response.data.data;
};

export const verify2FALogin = async (tempToken, otp) => {
  const response = await api.post("/auth/login/2fa-verify", { tempToken, otp });
  return response.data.data;
};

