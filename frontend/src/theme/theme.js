import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: "#3B82F6" },
    secondary: { main: "#10B981" },
    background: { default: "#0F172A", paper: "#1E293B" },
    text: { primary: "#E2E8F0", secondary: "#94A3B8" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Urbanist, system-ui, sans-serif",
  },
});
