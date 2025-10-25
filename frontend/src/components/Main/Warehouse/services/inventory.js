import axios from "axios";
import { getAuthHeaders } from "../../../../utils/api";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

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

export const getWarehouses = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Warehouses`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data || [];
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getWarehouseProducts = async (warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Warehouses/${warehouseId}`, {
      headers: { ...getAuthHeaders() },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateStock = async (warehouseId, payload) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/Warehouses/${warehouseId}/stock`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const updateWarehouseStock = async (
  warehouseId,
  productId,
  minQuantity
) => {
  try {
    const payload = {
      productId,
      quantityChange: 0,
      minQuantity,
    };

    const res = await axios.post(
      `${BASE_URL}/api/Warehouses/${warehouseId}/stock`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
