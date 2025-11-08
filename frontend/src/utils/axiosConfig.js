// src/services/axiosConfig.js
import axios from "axios";
import { useAuthStore } from "../store/auth";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

// Globalna podešavanja
axios.defaults.baseURL = `${BASE_URL}/api`;

// Pre svakog requesta ubacujemo token ako postoji
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("erp.token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Ako dođe 401 — izloguj korisnika i prebaci ga na login
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = "/login?session=expired";
      return;
    }
    return Promise.reject(error);
  }
);
