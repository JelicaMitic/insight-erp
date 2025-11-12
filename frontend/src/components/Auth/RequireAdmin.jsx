import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function RequireAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/403" replace />;
  }
  return children;
}
