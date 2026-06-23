import { api } from "@/lib/axios"


export const getAllLogs = async (params = {}) => {
    const response = await api.get("/audit-logs", { params });
    return response.data;
};


export const getLogById = async (logId) => {
    const response = await api.get(`/audit-logs/${logId}`);
    return response.data;
};

export const getProjectLogs = async (projectId) => {
    const response = await api.get(`/audit-logs/project/${projectId}`);
    return response.data;
};

export const getTaskLogs = async (taskId) => {
    const response = await api.get(`/audit-logs/tasks/${taskId}`);
    return response.data;
};