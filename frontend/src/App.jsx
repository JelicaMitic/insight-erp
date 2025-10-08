// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RequireAuth from "./routes/RequireAuth";

export default function App() {
  return (
    <Routes>
      {/* 🔐 LOGIN - jedina ruta dostupna bez autentikacije */}
      <Route path="/login" element={<Login />} />

      {/* 🔒 ZAŠTIĆENE RUTE */}
      <Route element={<MainLayout />}>
        {/* 📊 Dashboard - svi prijavljeni korisnici */}
        <Route
          element={<RequireAuth allowed={["Admin", "Referent", "Menadžer"]} />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 👤 Admin rute */}
        <Route element={<RequireAuth allowed={["Admin"]} />}>
          <Route path="/users" element={<div>Users</div>} />
        </Route>

        {/* 🏬 Referent + Menadžer rute */}
        <Route element={<RequireAuth allowed={["Referent", "Menadžer"]} />}>
          <Route path="/products" element={<div>Products</div>} />
          <Route path="/inventory" element={<div>Inventory</div>} />
          <Route path="/orders" element={<div>Orders</div>} />
          <Route path="/analytics" element={<div>Analytics</div>} />
        </Route>
      </Route>

      {/* 🚫 404 ruta */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
