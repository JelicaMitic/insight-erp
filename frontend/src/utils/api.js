import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACK_BASE_URL || "http://localhost:5000",
  timeout: 15000,
});

// U svaki zahtev ubacujemo Bearer ako postoji u LS
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Ako server vrati 401, brišemo kredencijale i vodimo na login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("erp.token");
      localStorage.removeItem("erp.user");
      const from = encodeURIComponent(
        window.location.pathname + window.location.search
      );
      window.location.assign(`/login?session=expired&from=${from}`);
    }
    return Promise.reject(err);
  }
);

export default api;
