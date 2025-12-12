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
import { Package, Boxes, Receipt, BarChart3, Users } from "lucide-react";

const drawerWidth = 200;
const nav = [
  { to: "/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
  { to: "/products", label: "Products", icon: <Package size={20} /> },
  { to: "/warehouse", label: "Warehouse", icon: <Boxes size={20} /> },
  { to: "/orders", label: "Orders", icon: <Receipt size={20} /> },
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
            <Box
              component="img"
              src="/insight_logo.png"
              alt="InsightERP Logo"
              sx={{
                height: 60,
                objectFit: "contain",
                userSelect: "none",
                ml: 1,
              }}
            />
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
