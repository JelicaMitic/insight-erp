import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TopbarUserMenu from "../components/TopbarUserMenu";

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
          <IconButton size="small"></IconButton>
          <TopbarUserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
// import Breadcrumbs from "./Breadcrumbs";
// import { Bell, Sun, Moon } from "lucide-react";
// import { useState } from "react";

// export default function Topbar() {
//   const [dark, setDark] = useState(true); // samo UI state za sada (Faza 9 će vezati na MUI)

//   return (
//     <header className="h-16 backdrop-blur border-b border-white/10 flex items-center justify-between px-4">
//       <Breadcrumbs />

//       <div className="flex items-center gap-2">
//         <button
//           className="p-2 rounded-lg hover:bg-white/10"
//           aria-label="Toggle theme"
//           onClick={() => setDark(!dark)}
//           title="Promeni temu"
//         >
//           {dark ? <Sun size={18} /> : <Moon size={18} />}
//         </button>
//         <button
//           className="p-2 rounded-lg hover:bg-white/10"
//           aria-label="Notifications"
//           title="Notifikacije"
//         >
//           <Bell size={18} />
//         </button>
//         <div
//           className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500"
//           title="Profil"
//         />
//       </div>
//     </header>
//   );
// }
