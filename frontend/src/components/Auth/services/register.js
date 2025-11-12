import axios from "axios";
const BASE_URL = import.meta.env.VITE_BACK_BASE_URL || "http://localhost:7061";

export const registerService = async ({
  username,
  email,
  password,
  roleId,
}) => {
  const { data } = await axios.post(
    `${BASE_URL}/api/Users`,
    {
      username,
      email,
      password,
      roleId,
    },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("erp.token")}` },
    }
  );
  return data;
};
