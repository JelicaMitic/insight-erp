import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RequireAuth from "./routes/RequireAuth";
import ProductsPage from "./pages/Products";
import Warehouse from "./pages/Warehouse";
import WarehouseDetails from "./pages/WarehouseDetails";
import OrdersPage from "./pages/Orders";
import AnalyticsPage from "./pages/AnalyticsPage";
import AnalyticsReportsPage from "./pages/AnalyticsReportsPage";
import RegisterPage from "./pages/Register";
import UsersAdminPage from "./pages/UsersAdminPage";
import "./utils/axiosConfig";

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

        <Route
          element={<RequireAuth allowed={["Referent", "Menadžer", "Admin"]} />}
        >
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/reports" element={<AnalyticsReportsPage />} />
          <Route path="/warehouse/:id" element={<WarehouseDetails />} />
        </Route>

        <Route element={<RequireAuth allowed={["Admin"]} />}>
          <Route path="/admin/register" element={<RegisterPage />} />
          <Route path="/users" element={<UsersAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
