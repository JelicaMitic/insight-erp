import { Navigate } from "react-router-dom";

export default function BlankPage() {
  return <Navigate to="/products" replace />;
}
