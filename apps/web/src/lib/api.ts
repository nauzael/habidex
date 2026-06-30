import axios from "axios";

const api = axios.create({
  baseURL: "https://habidex-api.fly.dev/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("habidex_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("habidex_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
