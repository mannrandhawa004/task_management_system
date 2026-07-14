import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantSlug = urlParams.get("workspace") || localStorage.getItem("active_tenant_slug");
    if (tenantSlug) {
      config.headers["x-tenant-slug"] = tenantSlug;
      localStorage.setItem("active_tenant_slug", tenantSlug);
      if (config.url?.includes("/auth/login") && config.data && typeof config.data === "object") {
        config.data.tenantSlug = tenantSlug;
      }
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh");

        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);
