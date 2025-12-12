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
        error.response.data?.message ||
        "Greška sa servera prilikom poziva API-ja.",
    });
  }
  if (error.request) {
    return Promise.reject({
      status: null,
      message: "Server nije dostupan.",
    });
  }
  return Promise.reject({
    status: null,
    message: error.message || "Greška.",
  });
};

/**
 * @typedef {Object} ProductCategory
 * @property {number} id
 * @property {string} name
 */

export const getCategoriesService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/productcategories`, {
      headers: { ...getAuthHeaders() },
    });
    /** @type {ProductCategory[]} */
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSingleCategoryService = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/productcategories/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
