import { useEffect, useState } from "react";
import { Box, Grid, Typography, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TextField } from "@mui/material";
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

export default function Products() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  const [editing, setEditing] = useState(null); // product object
  const [detailsId, setDetailsId] = useState(null); // id

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProductsService();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message || "Neuspešno učitavanje proizvoda.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onCreate = async (payload) => {
    const created = await createProductService(payload);
    // backend vraća objekat sa id-jem – dodaj u listu
    setItems((arr) => [created, ...arr]);
  };

  const onUpdate = async (payload) => {
    if (!editing) return;
    const updated = await updateProductService(editing.id, payload);
    setItems((arr) =>
      arr.map((it) => (it.id === editing.id ? { ...it, ...updated } : it))
    );
  };

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

  const filteredItems = items.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

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
          Proizvodi
        </Typography>
        <Button
          onClick={() => setCreateOpen(true)}
          startIcon={<AddIcon />}
          variant="contained"
        >
          Novi proizvod
        </Button>
      </Stack>
      <Box sx={{ width: "100%", mb: 3 }}>
        <TextField
          placeholder="Pretraži proizvode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.03)", // blago naglašena pozadina
            },
            "& input": {
              color: "white",
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} />,
          }}
        />
      </Box>

      {loading ? (
        <Typography variant="body2">Učitavanje...</Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nema proizvoda.
        </Typography>
      ) : (
        <>
          {/* 🧠 Filtriranje proizvoda */}
          {filteredItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nema proizvoda koji odgovaraju pretrazi.
            </Typography>
          ) : (
            <Grid container spacing={2} alignItems="stretch">
              {filteredItems.map((p) => (
                <Grid
                  key={p.id}
                  item
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: { xs: "100%", sm: "50%", md: "33.33%", lg: "25%" },
                  }}
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
        </>
      )}

      {/* Create */}
      <ProductForm
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      {/* Edit */}
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

      {/* Details (read-only -> toggle edit within modal) */}
      <ProductForm
        open={detailsOpen}
        mode="details"
        productId={detailsId}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsId(null);
        }}
        onSubmit={async (payload) => {
          // Ako korisnik iz details moda pređe u edit i sačuva
          const updated = await updateProductService(detailsId, payload);
          setItems((arr) =>
            arr.map((it) => (it.id === detailsId ? { ...it, ...updated } : it))
          );
        }}
      />
    </Box>
  );
}
