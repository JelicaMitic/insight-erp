import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

const getAuthHeaders = () => {
  const token = localStorage.getItem("erp.token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleAxiosError = (error) => {
  if (error.response)
    return Promise.reject({
      status: error.response.status,
      message: error.response.data?.message || "Greška sa servera.",
    });
  if (error.request)
    return Promise.reject({ status: null, message: "Server nije dostupan." });
  return Promise.reject({ status: null, message: error.message });
};

/** @typedef {Object} Order
 * @property {number} id
 * @property {string} date
 * @property {number} totalAmount
 * @property {string} invoiceStatus
 * @property {number} customerId
 * @property {string} customerName
 * @property {OrderItem[]} items
 */

export const getOrdersService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/orders`, {
      headers: getAuthHeaders(),
    });
    return res.data || [];
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const createOrderService = async (payload) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/orders`, payload, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    });
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const deleteOrderService = async (id) => {
  try {
    const res = await axios.delete(`${BASE_URL}/api/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const generateInvoiceService = async (orderId) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/invoices/${orderId}`, null, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const getCustomersService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/customers`, {
      headers: getAuthHeaders(),
    });
    return res.data || [];
  } catch (err) {
    return handleAxiosError(err);
  }
};

export const getProductsService = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/products`, {
      headers: getAuthHeaders(),
    });
    return res.data || [];
  } catch (err) {
    return handleAxiosError(err);
  }
};

// export const downloadInvoicePdfService = async (invoiceId) => {
//   try {
//     const res = await axios.get(`${BASE_URL}/api/invoices/${invoiceId}/pdf`, {
//       headers: getAuthHeaders(),
//       responseType: "blob",
//     });

//     const url = window.URL.createObjectURL(new Blob([res.data]));
//     window.open(url, "_blank");
//   } catch (err) {
//     return handleAxiosError(err);
//   }
// };

export const downloadInvoicePdfService = async (invoiceId) => {
  const token = localStorage.getItem("erp.token");

  const response = await axios.get(
    `${import.meta.env.VITE_BACK_BASE_URL}/api/invoices/${invoiceId}/pdf`,
    {
      responseType: "blob", // 👈 ključno!
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  window.open(url, "_blank"); // 👈 otvara kao pravi PDF u novom tabu
};
