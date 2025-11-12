import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

import { getUsersService, deleteUserService } from "./services/users";
import UserForm from "./UserForm";
import DeleteConfirmDialog from "./subcomponents/DeleteConfirmDialog";

const ROLE_LABELS = {
  1: "User",
  2: "Referent",
  3: "Menadžer",
  4: "Admin",
};

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [confirm, setConfirm] = useState(null); // { id, username }

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getUsersService();
      const normalized = (Array.isArray(data) ? data : []).map((u) => ({
        ...u,
        _id: u.id ?? u.userId ?? u._id,
        _roleLabel: u.role?.name || u.role || ROLE_LABELS[u.roleId || 0] || "—",
        _isActive: typeof u.isActive === "boolean" ? u.isActive : true,
      }));
      setItems(normalized);
    } catch (err) {
      toast.error(err.message || "Neuspešno učitavanje korisnika.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreated = (created) => {
    const norm = {
      ...created,
      _id: created.id ?? created.userId ?? created._id,
      _roleLabel:
        created.role?.name ||
        created.role ||
        ROLE_LABELS[created.roleId || 0] ||
        "—",
      _isActive:
        typeof created.isActive === "boolean" ? created.isActive : true,
    };
    setItems((arr) => [norm, ...arr]);
  };

  const askDelete = (row) =>
    setConfirm({ id: row._id, username: row.username });

  const doDelete = async () => {
    try {
      await deleteUserService(confirm.id);
      setItems((arr) => arr.filter((x) => x._id !== confirm.id));
      toast.success(`Korisnik "${confirm.username}" obrisan.`);
      setConfirm(null);
    } catch (err) {
      toast.error(err.message || "Brisanje nije uspelo.");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u._roleLabel || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filtered.slice(start, end);
  }, [filtered, page, rowsPerPage]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={800}>
          Users
        </Typography>

        <Button
          onClick={() => setCreateOpen(true)}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Register new user
        </Button>
      </Stack>

      {/* Search bar */}
      <Box sx={{ width: "100%", mb: 2 }}>
        <TextField
          placeholder="Pretraži po korisničkom imenu, emailu ili roli…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.03)",
            },
            "& input": { color: "white" },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
          }}
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {loading && <LinearProgress />}

        <TableContainer sx={{ maxHeight: "68vh" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Akcije
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                      sx={{ py: 3 }}
                    >
                      {loading
                        ? "Učitavanje…"
                        : "Nema korisnika koji odgovaraju kriterijumu."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u._roleLabel}
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u._isActive ? "Aktivan" : "Neaktivan"}
                        size="small"
                        sx={{ borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Obriši korisnika">
                        <IconButton color="error" onClick={() => askDelete(u)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Create modal */}
      <UserForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
      />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={Boolean(confirm)}
        username={confirm?.username}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
      />
    </Box>
  );
}
