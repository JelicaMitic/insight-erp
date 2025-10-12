import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import toast from "react-hot-toast";
import {
  getSingleProductService,
  getWarehousesService,
} from "./services/products";

export default function ProductForm({
  open,
  mode = "create",
  initialData = null,
  productId,
  onClose,
  onSubmit,
}) {
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isDetails = mode === "details";

  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState({});
  const [warehouses, setWarehouses] = useState([]);
  const [readOnly, setReadOnly] = useState(isDetails && !isEdit);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stockQuantity: "",
    description: "",
    warehouseId: "",
  });

  // Warehouses
  useEffect(() => {
    getWarehousesService()
      .then((data) => setWarehouses(data))
      .catch(() => toast.error("Neuspešno učitavanje skladišta."));
  }, []);

  // Helper: popuni formu + (opciono) atribute
  const fillFrom = (data) => {
    setForm({
      name: data?.name || "",
      price: data?.price ?? "",
      stockQuantity: data?.stockQuantity ?? "",
      description: data?.description || "",
      warehouseId: data?.warehouseId ?? "",
    });
    if (data?.attributes) {
      setAttributes(data.attributes);
    }
  };

  // Otvaranje modala / režimi
  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      setForm({
        name: "",
        price: "",
        stockQuantity: "",
        description: "",
        warehouseId: "",
      });
      setAttributes({});
      setReadOnly(false);
      return;
    }

    if (isDetails && productId != null) {
      setLoading(true);
      getSingleProductService(productId)
        .then((data) => {
          fillFrom(data);
          setReadOnly(true);
        })
        .catch((err) =>
          toast.error(err.message || "Neuspešno učitavanje proizvoda.")
        )
        .finally(() => setLoading(false));
      return;
    }

    if (isEdit) {
      // 1) odmah prikaži ono što imaš (da UI ne bude prazan)
      if (initialData) fillFrom(initialData);
      setReadOnly(false);

      // 2) uvek dovuci single-product da dobiješ attributes & sveže podatke
      if (productId != null) {
        setLoading(true);
        getSingleProductService(productId)
          .then((data) => fillFrom(data))
          .catch(() => toast.error("Neuspešno učitavanje proizvoda."))
          .finally(() => setLoading(false));
      }
      return;
    }
  }, [open, isCreate, isEdit, isDetails, initialData, productId]);

  const canSubmit = useMemo(() => {
    if (readOnly) return false;
    return (
      form.name.trim().length > 0 &&
      String(form.price).length > 0 &&
      String(form.stockQuantity).length > 0 &&
      String(form.warehouseId).length > 0
    );
  }, [form, readOnly]);

  const handleChange = (field) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [field]: v }));
  };

  // Helpers za atribute bazirane na indexu (stabilni ključevi)
  const attrEntries = Object.entries(attributes);
  const setAttrKeyByIndex = (index, newKey) => {
    const [oldKey, val] = attrEntries[index] || [];
    if (oldKey === undefined) return;
    setAttributes((prev) => {
      const updated = { ...prev };
      delete updated[oldKey];
      updated[newKey] = val;
      return updated;
    });
  };
  const setAttrValByIndex = (index, newVal) => {
    const [key] = attrEntries[index] || [];
    if (key === undefined) return;
    setAttributes((prev) => ({ ...prev, [key]: newVal }));
  };
  const deleteAttrByIndex = (index) => {
    const [key] = attrEntries[index] || [];
    if (key === undefined) return;
    setAttributes((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        description: form.description?.trim() || "",
        warehouseId: Number(form.warehouseId),
        attributes, // ✅ sada sigurno sadrži izmene
      };
      await onSubmit(payload);
      if (isCreate) {
        setForm({
          name: "",
          price: "",
          stockQuantity: "",
          description: "",
          warehouseId: "",
        });
        setAttributes({});
      }
      toast.success(isCreate ? "Proizvod kreiran." : "Proizvod izmenjen.");
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Operacija nije uspela.");
    } finally {
      setLoading(false);
    }
  };

  const title = isCreate
    ? "Kreiraj proizvod"
    : isEdit
    ? "Izmena proizvoda"
    : "Detalji proizvoda";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          maxHeight: "75vh", // visina modala
          overflowY: "auto", // dozvoljava samo glavni scroll
          "&::-webkit-scrollbar": { width: "8px" }, // tanji scrollbar
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {loading ? (
          <Stack alignItems="center" sx={{ p: 3 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Naziv"
              value={form.name}
              onChange={handleChange("name")}
              fullWidth
              disabled={readOnly}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Cena"
                type="number"
                value={form.price}
                onChange={handleChange("price")}
                fullWidth
                disabled={readOnly}
              />
              <TextField
                label="Količina"
                type="number"
                value={form.stockQuantity}
                onChange={handleChange("stockQuantity")}
                fullWidth
                disabled={readOnly}
              />
            </Stack>

            <TextField
              select
              label="Skladište"
              value={form.warehouseId}
              onChange={handleChange("warehouseId")}
              fullWidth
              disabled={readOnly}
            >
              {warehouses.length === 0 ? (
                <MenuItem disabled>Nema dostupnih skladišta</MenuItem>
              ) : (
                warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {`${w.id} - ${w.name}`}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Opis"
              value={form.description}
              onChange={handleChange("description")}
              fullWidth
              multiline
              minRows={3}
              disabled={readOnly}
            />

            {(isDetails || isEdit) && (
              <Box
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  mt: 2,
                  pt: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Atributi proizvoda
                  </Typography>
                  {!readOnly && (
                    <Button
                      size="small"
                      onClick={() =>
                        setAttributes((a) => {
                          // dodaj prazan unos; koristi unique ključ da ne pregazi postojeći
                          let n = 1;
                          let key = "atribut";
                          while (a.hasOwnProperty(`${key}_${n}`)) n++;
                          return { ...a, [`${key}_${n}`]: "" };
                        })
                      }
                    >
                      Dodaj
                    </Button>
                  )}
                </Stack>

                {attrEntries.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nema atributa.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {attrEntries.map(([k, v], idx) => (
                      <Stack
                        key={idx} // ✅ stabilan ključ
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <TextField
                          label="Naziv"
                          value={k}
                          onChange={(e) =>
                            setAttrKeyByIndex(idx, e.target.value)
                          }
                          size="small"
                          disabled={readOnly}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Vrednost"
                          value={v}
                          onChange={(e) =>
                            setAttrValByIndex(idx, e.target.value)
                          }
                          size="small"
                          disabled={readOnly}
                          sx={{ flex: 2 }}
                        />
                        {!readOnly && (
                          <Button
                            color="error"
                            size="small"
                            onClick={() => deleteAttrByIndex(idx)}
                          >
                            Obriši
                          </Button>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zatvori</Button>
        {!readOnly && (
          <Button
            onClick={submit}
            variant="contained"
            disabled={!canSubmit || loading}
          >
            {isCreate ? "Kreiraj" : "Sačuvaj"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
