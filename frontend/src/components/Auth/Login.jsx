import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/auth";
import { loginService } from "./services/login";

const Login = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const sessionExpired = sp.get("session") === "expired";
  const from = sp.get("from") || "";

  const redirectForRole = useAuthStore((s) => s.redirectForRole);
  const setCredentials = useAuthStore((s) => s.setCredentials);

  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (sessionExpired) toast.error("Sesija je istekla. Prijavi se ponovo.");
  }, [sessionExpired]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.email || !form.password) {
      setErrorMessage("Unesi email i lozinku.");
      return;
    }

    try {
      setLoading(true);
      const { token, user } = await loginService(
        form.email.trim(),
        form.password
      );
      setCredentials(token, user);
      toast.success("Dobrodošao nazad!");
      if (from) navigate(decodeURIComponent(from), { replace: true });
      else navigate(redirectForRole(), { replace: true });
    } catch (err) {
      console.log("Login error:", err);

      let message = err.message || "Neuspešan login.";

      if (err.status === 400 || err.status === 401) {
        message =
          "Neispravni kredencijali. Proveri korisničko ime ili lozinku.";
      } else if (err.status === 500) {
        message = "Greška na serveru. Pokušaj ponovo kasnije.";
      }

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background:
          "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          sx={{
            width: 380,
            borderRadius: 4,
            boxShadow: "0 10px 40px rgba(0,0,0,.35)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
              Insight ERP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Prijavi se da nastaviš
            </Typography>

            <form onSubmit={onSubmit}>
              <TextField
                label="Email ili korisničko ime"
                type="text"
                value={form.email}
                fullWidth
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                sx={{ mb: 2 }}
                autoFocus
              />

              <TextField
                label="Lozinka"
                type={showPwd ? "text" : "password"}
                value={form.password}
                fullWidth
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd((v) => !v)}
                        edge="end"
                        aria-label="toggle password"
                      >
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {errorMessage && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{
                    mt: 1,
                    mb: 2,
                    textAlign: "center",
                    fontWeight: 500,
                  }}
                >
                  {errorMessage}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {loading ? "Prijavljivanje..." : "Prijavi se"}
              </Button>
            </form>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            ></Typography>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Login;
