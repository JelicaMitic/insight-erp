import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getWarehouseProducts,
  updateWarehouseStock,
} from "./services/inventory";
import AddStockDrawer from "./subcomponents/AddStockDrawer";

export default function WarehouseDetails() {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getWarehouseProducts(id);
      setWarehouse(data);
      setLoading(false);
      console.log("Warehouse details:", data);
    })();
  }, [id]);

  const filteredProducts = useMemo(() => {
    if (!warehouse?.products) return [];
    return warehouse.products.filter((p) =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [warehouse, filter]);

  const reloadWarehouse = async () => {
    setLoading(true);
    const data = await getWarehouseProducts(id);
    setWarehouse(data);
    setLoading(false);
  };
  useEffect(() => {
    reloadWarehouse();
  }, [id]);

  const columns = [
    { field: "id", headerName: "ID", width: 80, sortable: true },
    {
      field: "name",
      headerName: "Product",
      flex: 1,
      minWidth: 150,
      sortable: true,
    },
    {
      field: "stockQuantity",
      headerName: "Qty",
      type: "number",
      width: 100,
      align: "right",
      headerAlign: "right",
    },
    {
      field: "minQuantity",
      headerName: "Min",
      type: "number",
      width: 100,
      align: "right",
      headerAlign: "right",
      editable: true,
    },
    {
      field: "price",
      headerName: "Price (RSD)",
      width: 140,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => {
        console.log(params);
        return params.toLocaleString("sr-RS") + " RSD";
      },
    },
    {
      field: "total",
      headerName: "Total (RSD)",
      width: 160,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => {
        const price = Number(params.row?.price) || 0;
        const qty = Number(params.row?.stockQuantity) || 0;
        return `${(price * qty).toLocaleString("sr-RS")} RSD`;
      },
    },

    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) =>
        params.row.stockQuantity < params.row.minQuantity ? "🔴 Low" : "🟢 OK",
    },
  ];

  const handleProcessRowUpdate = async (newRow, oldRow) => {
    try {
      if (newRow.minQuantity !== oldRow.minQuantity) {
        await updateWarehouseStock(id, newRow.id, newRow.minQuantity);
        await reloadWarehouse();
      }

      return newRow;
    } catch (error) {
      console.error("Greška pri ažuriranju minimalne količine:", error);
      return oldRow;
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={3}>
        🏭 {warehouse?.name || "Loading..."} — {warehouse?.location || ""}
      </Typography>

      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <TextField
          label="Filter by name"
          variant="outlined"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button variant="contained" onClick={() => setDrawerOpen(true)}>
          ➕ Dodaj proizvod
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box height={500}>
          <DataGrid
            rows={filteredProducts}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            processRowUpdate={handleProcessRowUpdate}
            editMode="cell"
            disableRowSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          />
        </Box>
      )}

      <AddStockDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        warehouseId={id}
        onAdded={reloadWarehouse}
      />
    </Box>
  );
}
