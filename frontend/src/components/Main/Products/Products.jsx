import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import toast from "react-hot-toast";

import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import {
  getProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "./services/products";
import { getCategoriesService } from "./services/categories"; // ✅ import kategorija

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); // 🔹 kategorije
  const [selectedCategory, setSelectedCategory] = useState(""); // 🔹 izabrana kategorija
  const [search, setSearch] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  // 🔄 Učitavanje proizvoda i kategorija
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [products, cats] = await Promise.all([
          getProductsService(),
          getCategoriesService(),
        ]);
        setItems(Array.isArray(products) ? products : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        toast.error(err.message || "Greška pri učitavanju podataka.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ➕ Create
  const onCreate = async (payload) => {
    const created = await createProductService(payload);
    setItems((arr) => [created, ...arr]);
  };

  // ✏️ Update
  const onUpdate = async (payload) => {
    if (!editing) return;
    const updated = await updateProductService(editing.id, payload);
    setItems((arr) =>
      arr.map((it) => (it.id === editing.id ? { ...it, ...updated } : it))
    );
  };

  // ❌ Delete
  const onDelete = async (id) => {
    try {
      await deleteProductService(id);
      setItems((arr) => arr.filter((it) => it.id !== id));
      toast.success("Proizvod obrisan.");
    } catch (err) {
      toast.error(err.message || "Brisanje nije uspelo.");
    }
  };

  const openEdit = (product) => {
    setEditing(product);
    setEditOpen(true);
  };

  const openDetails = (id) => {
    setDetailsId(id);
    setDetailsOpen(true);
  };

  // 🔍 Filter po imenu/opisu + kategoriji
  const filteredItems = items.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || p.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={800}>
          Pregled proizvoda
        </Typography>

        <Button
          onClick={() => setCreateOpen(true)}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Novi proizvod
        </Button>
      </Stack>

      {/* Search + Category Filter */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Pretraži proizvode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ opacity: 0.6 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.03)",
            },
            "& input": { color: "white" },
          }}
        />

        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 3,
          }}
        >
          <InputLabel id="category-label" sx={{ color: "white" }}>
            Kategorija
          </InputLabel>
          <Select
            labelId="category-label"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Kategorija"
            sx={{
              color: "white",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.2)",
              },
              "& .MuiSvgIcon-root": { color: "white" },
            }}
          >
            <MenuItem value="">Sve kategorije</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.name}>
                {cat.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Main content */}
      {loading ? (
        <Typography variant="body2">Učitavanje...</Typography>
      ) : filteredItems.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nema proizvoda koji odgovaraju kriterijumu pretrage.
        </Typography>
      ) : (
        <Grid container spacing={2} alignItems="stretch">
          {filteredItems.map((p) => (
            <Grid
              key={p.id}
              item
              xs={12}
              sm={6}
              md={4}
              lg={4}
              sx={{ display: "flex" }}
            >
              <ProductCard
                product={p}
                onEdit={openEdit}
                onDelete={onDelete}
                onDetails={openDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Forms */}
      <ProductForm
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      <ProductForm
        open={editOpen}
        mode="edit"
        initialData={editing}
        productId={editing?.id}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSubmit={onUpdate}
      />

      <ProductForm
        open={detailsOpen}
        mode="details"
        productId={detailsId}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsId(null);
        }}
        onSubmit={async (payload) => {
          const updated = await updateProductService(detailsId, payload);
          setItems((arr) =>
            arr.map((it) => (it.id === detailsId ? { ...it, ...updated } : it))
          );
        }}
      />
    </Box>
  );
}
