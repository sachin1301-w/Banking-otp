import axios from "axios";

// Points at the Spring Boot backend. Override with VITE_API_BASE_URL if it runs elsewhere.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing/expired/rejected by the server: force a clean re-login.
      localStorage.removeItem("ledger_token");
      localStorage.removeItem("ledger_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
