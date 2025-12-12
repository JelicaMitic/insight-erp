import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Box,
  MenuItem,
  Collapse,
} from "@mui/material";
import toast from "react-hot-toast";
import {
  getSingleProductService,
  getWarehousesService,
  getProductStockByWarehouseService,
} from "./services/products";
import { getCategoriesService } from "./services/categories";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

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
  const [categories, setCategories] = useState([]);
  const [warehouseStocks, setWarehouseStocks] = useState([]);
  const [readOnly, setReadOnly] = useState(isDetails && !isEdit);
  const [stockOpen, setStockOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    categoryId: "",
  });

  useEffect(() => {
    getWarehousesService()
      .then((data) => setWarehouses(data))
      .catch(() => toast.error("Neuspešno učitavanje skladišta."));

    getCategoriesService()
      .then((data) => setCategories(data))
      .catch(() => toast.error("Neuspešno učitavanje kategorija."));
  }, []);

  const fillFrom = (data) => {
    setForm({
      name: data?.name || "",
      price: data?.price ?? "",
      description: data?.description || "",
      categoryId: data?.categoryId || "",
    });
    if (data?.attributes) {
      setAttributes(data.attributes);
    }
  };

  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      setForm({
        name: "",
        price: "",
        description: "",
        categoryId: "",
      });
      setAttributes({});
      setReadOnly(false);
      return;
    }

    if (isDetails && productId != null) {
      setLoading(true);
      Promise.all([
        getSingleProductService(productId),
        getProductStockByWarehouseService(productId),
      ])
        .then(([productData, stockData]) => {
          fillFrom(productData);
          setWarehouseStocks(stockData);
          setReadOnly(true);
        })
        .catch(() => toast.error("Neuspešno učitavanje proizvoda ili zaliha."))
        .finally(() => setLoading(false));
      return;
    }
    if (isEdit) {
      if (initialData) fillFrom(initialData);
      setReadOnly(false);

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
      !!form.categoryId
    );
  }, [form, readOnly]);

  const handleChange = (field) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [field]: v }));
  };

  // --- postojeći atributi ---
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
        description: form.description?.trim() || "",
        categoryId: form.categoryId,
        attributes,
      };
      await onSubmit(payload);
      if (isCreate) {
        setForm({
          name: "",
          price: "",
          description: "",
          categoryId: "",
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
          maxHeight: "75vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "8px" },
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
                select
                label="Kategorija"
                value={form.categoryId}
                onChange={handleChange("categoryId")}
                fullWidth
                disabled={readOnly}
              >
                <MenuItem value="">-- Izaberi kategoriju --</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

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
                        key={idx}
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

        {isDetails && (
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
              sx={{ cursor: "pointer", mb: 1 }}
              onClick={() => setStockOpen((o) => !o)}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Proveri stanje po skladištima
              </Typography>

              <KeyboardArrowDownIcon
                sx={{
                  transition: "0.25s",
                  transform: stockOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Stack>

            <Collapse in={stockOpen} timeout="300">
              {warehouseStocks.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Nema podataka o zalihama.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ pb: 1 }}>
                  {warehouseStocks.map((w) => (
                    <Box
                      key={w.warehouseId}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      <Typography>{w.warehouseName}</Typography>
                      <Typography fontWeight={600}>
                        {w.stockQuantity} kom
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Collapse>
          </Box>
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
