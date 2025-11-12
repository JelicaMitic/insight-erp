// src/components/Auth/services/users.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

const getAuthHeaders = () => {
  const token = localStorage.getItem("erp.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAxiosError = (error) => {
  if (error.response) {
    return Promise.reject({
      status: error.response.status,
      data: error.response.data,
      message:
        error.response.data?.message || "Greška sa servera prilikom poziva",
    });
  }
  if (error.request) {
    return Promise.reject({ status: null, message: "Server nije dostupan." });
  }
  return Promise.reject({ status: null, message: error.message || "Greška." });
};

/** Tipični format korisnika sa backenda:
 * { id, username, email, roleId?, role?, isActive? }
 */

// LIST
export const getUsersService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Users`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};

// CREATE (admin registruje)
export const registerUserService = async ({
  username,
  email,
  password,
  roleId,
}) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/Users`,
      { username, email, password, roleId }, // tvoj RegisterUserDto
      { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

// DELETE
export const deleteUserService = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/api/Users/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

// (opciono) Rols ako imaš endpoint /api/Roles
export const getRolesService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Roles`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data || [];
  } catch (error) {
    // fallback — UI će koristiti statičku listu
    return [];
  }
};
