import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RequireAuth from "./routes/RequireAuth";
import ProductsPage from "./pages/Products";
import Warehouse from "./pages/Warehouse";
import WarehouseDetails from "./pages/WarehouseDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<MainLayout />}>
        <Route
          element={<RequireAuth allowed={["Admin", "Referent", "Menadžer"]} />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<RequireAuth allowed={["Admin"]} />}>
          <Route path="/users" element={<div>Users</div>} />
        </Route>

        <Route element={<RequireAuth allowed={["Referent", "Menadžer"]} />}>
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/orders" element={<div>Orders</div>} />
          <Route path="/analytics" element={<div>Analytics</div>} />
          <Route path="/warehouse/:id" element={<WarehouseDetails />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
