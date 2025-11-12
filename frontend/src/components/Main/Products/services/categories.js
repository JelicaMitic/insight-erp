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

/** 🔹 Dohvata sve kategorije proizvoda */
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

/** 🔹 Dohvata jednu kategoriju po ID-ju */
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

/** 🔹 (Opciono) Kreiranje nove kategorije */
// export const createCategoryService = async (payload) => {
//   try {
//     const res = await axios.post(`${BASE_URL}/api/productcategories`, payload, {
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     });
//     return res.data;
//   } catch (error) {
//     return handleAxiosError(error);
//   }
// };

/** 🔹 (Opciono) Izmena postojeće kategorije */
// export const updateCategoryService = async (id, payload) => {
//   try {
//     const res = await axios.put(
//       `${BASE_URL}/api/productcategories/${id}`,
//       payload,
//       {
//         headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       }
//     );
//     return res.data;
//   } catch (error) {
//     return handleAxiosError(error);
//   }
// };

/** 🔹 (Opciono) Brisanje kategorije */
// export const deleteCategoryService = async (id) => {
//   try {
//     const res = await axios.delete(`${BASE_URL}/api/productcategories/${id}`, {
//       headers: { ...getAuthHeaders() },
//     });
//     return res.data;
//   } catch (error) {
//     return handleAxiosError(error);
//   }
// };
