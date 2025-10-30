import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { getAuthHeaders } from "../../../../utils/api";

export default function AddStockDrawer({
  open,
  onClose,
  warehouseId,
  onAdded,
}) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://localhost:7061/api/products?search=${search}`,
          {
            headers: { ...getAuthHeaders() },
          }
        );

        setProducts(res.data || []);
      } catch (err) {
        console.error("Greška pri učitavanju proizvoda:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [open, search]);

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) return;

    await axios.post(
      `https://localhost:7061/api/Warehouses/${warehouseId}/stock`,
      {
        productId: selectedProduct.id,
        quantityChange: Number(quantity),
      },
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    onAdded?.();
    onClose();
    setSelectedProduct(null);
    setQuantity("");
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={400} p={3}>
        <Typography variant="h6" mb={2}>
          ➕ Dodaj proizvod u skladište
        </Typography>

        <Autocomplete
          disablePortal
          options={products}
          getOptionLabel={(option) => option.name || ""}
          loading={loading}
          value={selectedProduct}
          onChange={(e, val) => setSelectedProduct(val)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Pretraga proizvoda"
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          label="Količina"
          type="number"
          fullWidth
          size="small"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedProduct || !quantity}
        >
          ✅ Dodaj u skladište
        </Button>
      </Box>
    </Drawer>
  );
}
