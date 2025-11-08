import { useEffect, useState } from "react";
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
  Box,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import toast from "react-hot-toast";
import {
  createOrderService,
  getCustomersService,
  getProductsService,
  getWarehousesService,
} from "./services/orders";

export default function OrderForm({ open, onClose, onSubmit }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [form, setForm] = useState({
    customerId: "",
    warehouseId: "",
    items: [],
  });

  // Učitaj sve potrebne liste kada se dijalog otvori
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [cs, ps, ws] = await Promise.all([
          getCustomersService(),
          getProductsService(),
          getWarehousesService(),
        ]);
        setCustomers(cs);
        setProducts(ps);
        setWarehouses(ws);

        // podrazumevano skladište (prvo dostupno) ako ništa nije izabrano
        setForm((f) => ({
          ...f,
          warehouseId: f.warehouseId || (ws[0]?.id ?? ""),
        }));
      } catch {
        toast.error("Greška pri učitavanju podataka.");
      }
    })();
  }, [open]);

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: "", quantity: 1 }],
    }));

  const removeItem = (index) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }));

  const handleChangeItem = (index, field, value) =>
    setForm((f) => {
      const items = [...f.items];
      items[index][field] = value;
      return { ...f, items };
    });

  const handleSubmit = async () => {
    if (!form.customerId) return toast.error("Izaberite kupca.");
    if (!form.warehouseId) return toast.error("Izaberite skladište.");
    if (form.items.length === 0)
      return toast.error("Dodajte barem jedan proizvod.");
    if (form.items.some((it) => !it.productId || it.quantity <= 0)) {
      return toast.error("Proverite da su sve stavke ispravno popunjene.");
    }

    try {
      await createOrderService({
        userId: 1, // TODO: zameni realnim userId iz auth-a
        customerId: +form.customerId,
        warehouseId: +form.warehouseId,
        items: form.items.map((it) => ({
          productId: +it.productId,
          quantity: +it.quantity,
        })),
      });
      toast.success("Porudžbina uspešno kreirana!");
      onSubmit?.();
    } catch (err) {
      toast.error(err.message || "Greška pri čuvanju porudžbine.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nova porudžbina</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          <TextField
            select
            label="Kupac"
            value={form.customerId}
            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
            fullWidth
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Skladište"
            value={form.warehouseId}
            onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
            fullWidth
            disabled={warehouses.length === 0}
            helperText={
              warehouses.length === 0 ? "Nema dostupnih skladišta." : ""
            }
          >
            {warehouses.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name}
                {w.location ? ` — ${w.location}` : ""}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Stavke porudžbine
            </Typography>

            {form.items.map((item, index) => (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                key={index}
                mb={1}
              >
                <TextField
                  select
                  label="Proizvod"
                  value={item.productId}
                  onChange={(e) =>
                    handleChangeItem(index, "productId", e.target.value)
                  }
                  sx={{ flex: 2 }}
                >
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  type="number"
                  label="Količina"
                  value={item.quantity}
                  onChange={(e) =>
                    handleChangeItem(index, "quantity", +e.target.value)
                  }
                  sx={{ width: 120 }}
                  inputProps={{ min: 1 }}
                />

                <IconButton color="error" onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Stack>
            ))}

            <Button startIcon={<AddIcon />} onClick={addItem}>
              Dodaj stavku
            </Button>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Otkaži</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Sačuvaj
        </Button>
      </DialogActions>
    </Dialog>
  );
}
