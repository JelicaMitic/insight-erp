import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  ListItemIcon,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function TopbarUserMenu() {
  const { user, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Tooltip title={user?.email || "Profil"}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            {(user?.username?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: "visible",
            mt: 1.5,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 16,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem disabled>
          {user?.username || user?.email || "Korisnik"}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Odjavi se
        </MenuItem>
      </Menu>
    </>
  );
}
