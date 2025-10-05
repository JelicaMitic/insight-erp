import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function Login() {
  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sign in
        </Typography>
        <TextField fullWidth label="Email" margin="normal" />
        <TextField fullWidth label="Password" type="password" margin="normal" />
        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </Paper>
    </Box>
  );
}
