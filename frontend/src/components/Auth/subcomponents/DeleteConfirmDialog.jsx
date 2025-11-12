import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  username,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Brisanje korisnika</DialogTitle>
      <DialogContent>
        <Typography>
          Da li sigurno želiš da obrišeš korisnika <b>{username}</b>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Otkaži</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Obriši
        </Button>
      </DialogActions>
    </Dialog>
  );
}
