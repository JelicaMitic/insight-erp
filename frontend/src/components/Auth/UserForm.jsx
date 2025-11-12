// src/components/Auth/UserForm.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { getRolesService, registerUserService } from "./services/users";
import toast from "react-hot-toast";

const STATIC_ROLES = [
  { id: 1, label: "User" },
  { id: 2, label: "Referent" },
  { id: 3, label: "Menadžer" },
  { id: 4, label: "Admin" },
];

export default function UserForm({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState(STATIC_ROLES);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    roleId: STATIC_ROLES[0].id,
  });

  useEffect(() => {
    if (!open) return;
    // pokušaj fetch rola, fallback na STATIC_ROLES
    (async () => {
      const fetched = await getRolesService();
      if (Array.isArray(fetched) && fetched.length) {
        // očekujem { id, name }
        setRoles(fetched.map((r) => ({ id: r.id, label: r.name })));
        setForm((f) => ({ ...f, roleId: fetched[0].id }));
      } else {
        setRoles(STATIC_ROLES);
        setForm((f) => ({ ...f, roleId: STATIC_ROLES[0].id }));
      }
    })();
  }, [open]);

  const canSubmit = useMemo(
    () =>
      form.username.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      Number(form.roleId) > 0,
    [form]
  );

  const onChange = (k) => (e) => {
    const v = k === "roleId" ? Number(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const created = await registerUserService({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: form.roleId,
      });
      toast.success("Korisnik uspešno kreiran.");
      onCreated?.(created);
      onClose?.();
      setForm({
        username: "",
        email: "",
        password: "",
        roleId: roles[0]?.id ?? 1,
      });
    } catch (err) {
      toast.error(err.message || "Registracija nije uspela.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Register new user
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            value={form.username}
            onChange={onChange("username")}
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={onChange("email")}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={onChange("password")}
            fullWidth
          />
          <TextField
            select
            label="Role"
            value={form.roleId}
            onChange={onChange("roleId")}
            fullWidth
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zatvori</Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={!canSubmit || loading}
        >
          {loading ? <CircularProgress size={20} /> : "Kreiraj"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
