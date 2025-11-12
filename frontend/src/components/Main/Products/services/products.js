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

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {number} stockQuantity
 * @property {string} [description]
 */

export const getProductsService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products`, {
      headers: { ...getAuthHeaders() },
    });
    /** @type {Product[]} */
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSingleProductService = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
export const getWarehousesService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Warehouses`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};

/** @param {Omit<Product, 'id'>} payload */
export const createProductService = async (payload) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/products`, payload, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/** @param {number} id @param {Partial<Product>} payload */
export const updateProductService = async (id, payload) => {
  try {
    const res = await axios.put(`${BASE_URL}/api/products/${id}`, payload, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const deleteProductService = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/api/products/${id}`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getProductStockByWarehouseService = async (productId) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/products/${productId}/warehouses`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};
