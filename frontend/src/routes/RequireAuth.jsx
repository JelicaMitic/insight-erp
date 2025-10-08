import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function RequireAuth({ allowed = [] }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login`} replace />;
  }

  if (allowed.length && user && !allowed.includes(user.role)) {
    // 403 -> pametan redirect na default rutu po ulozi
    const map = {
      Admin: "/users",
      Referent: "/products",
      Menadžer: "/dashboard",
    };
    return <Navigate to={map[user.role] || "/dashboard"} replace />;
  }

  return <Outlet />;
}
