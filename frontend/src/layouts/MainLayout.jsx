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

const drawerWidth = 240;
const nav = [
  { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/products", label: "Products", icon: <Package size={20} /> },
  { to: "/inventory", label: "Inventory", icon: <Boxes size={20} /> },
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
        <Toolbar>
          <Typography variant="h6">Insight ERP</Typography>
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
