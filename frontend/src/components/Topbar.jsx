import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import TopbarUserMenu from "../components/TopbarUserMenu";
import usePageTitle from "../hooks/usePageTitle";

export default function Topbar() {
  const title = usePageTitle();

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
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small"></IconButton>
          <TopbarUserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
