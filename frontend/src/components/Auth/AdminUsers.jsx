import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import toast from "react-hot-toast";
import { getUsersService, deleteUserService } from "./services/users";
import DeleteConfirmDialog from "./subcomponents/DeleteConfirmDialog";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getUsersService();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      toast.error(e.message || "Ne mogu da učitam korisnike.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteUserService(toDelete.id);
      toast.success("Korisnik obrisan.");
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.message || "Brisanje nije uspelo.");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ maxWidth: 900, mx: "auto", borderRadius: 4 }}>
        {loading && <LinearProgress />}
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Korisnici (ADMIN)
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Korisničko ime</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rola</TableCell>
                <TableCell align="right">Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((u) => {
                const id = u.id ?? u.userId ?? u._id; // tolerantno
                return (
                  <TableRow key={id}>
                    <TableCell>{id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Obriši">
                        <IconButton
                          color="error"
                          onClick={() =>
                            setToDelete({ id, username: u.username })
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography align="center" color="text.secondary">
                      Nema korisnika za prikaz.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <DeleteConfirmDialog
            open={Boolean(toDelete)}
            username={toDelete?.username}
            onClose={() => setToDelete(null)}
            onConfirm={confirmDelete}
          />
        </CardContent>
      </Card>
    </Box>
  );
}
