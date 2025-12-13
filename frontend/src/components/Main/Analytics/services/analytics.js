import axios from "axios";
import { getAuthHeaders } from "../../../../utils/api";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

const handleAxiosError = (error) => {
  if (error.response) {
    return Promise.reject({
      status: error.response.status,
      data: error.response.data,
      message: error.response.data?.message || "Greška sa servera.",
    });
  }
  if (error.request)
    return Promise.reject({ status: null, message: "Server nije dostupan." });
  return Promise.reject({ status: null, message: error.message });
};

// ------ PRESET (7/30/365) ------
export const getOverviewPreset = async (days, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/overview`, {
      headers: { ...getAuthHeaders() },
      params: { preset: days, warehouseId: warehouseId ?? undefined }, // 7 | 30 | 365
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSalesTrendPreset = async (days, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/sales-trend`, {
      headers: { ...getAuthHeaders() },
      params: { preset: days, warehouseId: warehouseId ?? undefined },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSalesByWarehousePreset = async (days) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/by-warehouse`, {
      headers: { ...getAuthHeaders() },
      params: { preset: days },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getTopProductsPreset = async (days, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/top-products`, {
      headers: { ...getAuthHeaders() },
      params: { preset: days, warehouseId: warehouseId ?? undefined },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

// ------ CUSTOM (from/to) ------
export const getOverview = async (from, to, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/overview`, {
      headers: { ...getAuthHeaders() },
      params: { from, to, warehouseId: warehouseId ?? undefined },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSalesTrend = async (from, to, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/sales-trend`, {
      headers: { ...getAuthHeaders() },
      params: { from, to, warehouseId: warehouseId ?? undefined },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getSalesByWarehouse = async (from, to) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/by-warehouse`, {
      headers: { ...getAuthHeaders() },
      params: { from, to },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const getTopProducts = async (from, to, warehouseId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/Analytics/top-products`, {
      headers: { ...getAuthHeaders() },
      params: { from, to, warehouseId: warehouseId ?? undefined },
    });
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const runEtl = async (from, to) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/Analytics/etl/run`,
      {},
      {
        headers: { ...getAuthHeaders() },
        params: { from, to },
      }
    );
    return res.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};
