import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Topbar() {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Insight ERP
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
          <Avatar sx={{ width: 30, height: 30 }}>VL</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
