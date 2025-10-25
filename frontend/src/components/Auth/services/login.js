import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

export const loginService = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      usernameOrEmail: email,
      password,
    });

    const {
      token,
      username,
      email: userEmail,
      role,
      expiresAtUtc,
    } = response.data;

    const user = { username, email: userEmail, role, expiresAtUtc };

    localStorage.setItem("erp.token", token);
    localStorage.setItem("erp.user", JSON.stringify(user));

    return { token, user };
  } catch (error) {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message:
          error.response.data?.message || "Greška sa servera prilikom logina",
      });
    }

    if (error.request) {
      return Promise.reject({
        status: null,
        message: "Server nije dostupan. Proveri konekciju.",
      });
    }

    return Promise.reject({
      status: null,
      message: error.message || "Došlo je do greške.",
    });
  }
};
