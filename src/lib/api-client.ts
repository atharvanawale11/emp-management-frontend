import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
});

apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem("atlas.auth.v1");
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token: string };
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("atlas.auth.v1");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);