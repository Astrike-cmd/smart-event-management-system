import axios from "axios";

console.log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);

let authToken = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
});

export const setApiAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export default api;