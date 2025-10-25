import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Topbar from "../components/Topbar";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Receipt,
  BarChart3,
  Users,
} from "lucide-react";

const drawerWidth = 200;
const nav = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/products", label: "Products", icon: <Package size={20} /> },
  { to: "/warehouse", label: "Warehouse", icon: <Boxes size={20} /> },
  { to: "/orders", label: "Orders", icon: <Receipt size={20} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
  { to: "/users", label: "Users", icon: <Users size={20} /> },
];

export default function MainLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "center",
            alignItems: "center",
            py: 2,
            userSelect: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
            }}
          >
            {/* Minimalistički simbol */}
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                background: "linear-gradient(135deg, #af54e8 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(175,84,232,0.4)",
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                IE
              </Typography>
            </Box>

            {/* Naziv aplikacije */}
            <Typography
              sx={{
                fontSize: "1.4rem",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                background: "linear-gradient(90deg, #af54e8 0%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Inter', 'Poppins', sans-serif",
              }}
            >
              Insight
              <Box
                component="span"
                sx={{
                  ml: 0.5,
                  color: (theme) =>
                    theme.palette.mode === "light" ? "#555" : "#ddd",
                  fontWeight: 600,
                  opacity: 0.8,
                }}
              >
                ERP
              </Box>
            </Typography>
          </Box>
        </Toolbar>

        <List>
          {nav.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{ "&.active": { backgroundColor: "action.selected" } }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Topbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
