import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { registerService } from "./services/register";

// Ako tvoji ID-jevi nisu ovi, prilagodi vrednosti:
const ROLE_OPTIONS = [
  { id: 1, label: "User" },
  { id: 2, label: "Referent" },
  { id: 3, label: "Menadžer" },
  { id: 4, label: "Admin" },
];

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roleId: ROLE_OPTIONS[0].id, // default na prvu u listi
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: k === "roleId" ? Number(e.target.value) : e.target.value,
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.username || !form.email || !form.password || !form.roleId) {
      setErr("Sva polja su obavezna.");
      return;
    }

    try {
      setLoading(true);
      await registerService({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: form.roleId,
      });
      toast.success("Korisnik uspešno kreiran.");
      setForm({
        username: "",
        email: "",
        password: "",
        roleId: ROLE_OPTIONS[0].id,
      });
    } catch (ex) {
      setErr(ex.message || "Registracija nije uspela.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card
          sx={{
            width: 460,
            borderRadius: 4,
            boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Registracija (ADMIN)
            </Typography>

            <form onSubmit={onSubmit}>
              <TextField
                label="Korisničko ime"
                fullWidth
                sx={{ mb: 2 }}
                value={form.username}
                onChange={onChange("username")}
                autoFocus
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                sx={{ mb: 2 }}
                value={form.email}
                onChange={onChange("email")}
              />
              <TextField
                label="Lozinka"
                type="password"
                fullWidth
                sx={{ mb: 2 }}
                value={form.password}
                onChange={onChange("password")}
              />

              <TextField
                select
                label="Rola"
                fullWidth
                sx={{ mb: 2 }}
                value={form.roleId}
                onChange={onChange("roleId")}
              >
                {ROLE_OPTIONS.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>

              {err && (
                <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
                  {err}
                </Typography>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? "Kreiranje..." : "Kreiraj nalog"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
