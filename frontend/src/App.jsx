import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<div>Products</div>} />
        <Route path="/inventory" element={<div>Inventory</div>} />
        <Route path="/orders" element={<div>Orders</div>} />
        <Route path="/analytics" element={<div>Analytics</div>} />
        <Route path="/users" element={<div>Users</div>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
