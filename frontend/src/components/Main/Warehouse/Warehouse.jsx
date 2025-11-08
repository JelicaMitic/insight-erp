import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { getWarehouses } from "./services/inventory";

export default function Warehouse() {
  const [warehouses, setWarehouses] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getWarehouses();

      const enriched = data.map((w) => ({
        ...w,
        totalItems: w.products?.length || 0,
        totalValue: w.products
          ? w.products.reduce((acc, p) => acc + p.price * p.stockQuantity, 0)
          : 0,
        lowStockCount:
          w.products?.filter((p) => p.stockQuantity < p.minQuantity).length ||
          0,
      }));

      setWarehouses(enriched);
      setLoading(false);
    })();
  }, []);

  const handleDetails = (warehouseId) => {
    navigate(`/warehouse/${warehouseId}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Warehouse", flex: 1, minWidth: 150 },
    { field: "location", headerName: "Location", flex: 1, minWidth: 150 },
    {
      field: "totalItems",
      headerName: "Total Items",
      width: 130,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) => params.toLocaleString("sr-RS"),
    },
    {
      field: "lowStockCount",
      headerName: "Low Stock",
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) =>
        params.value > 0 ? `🔴 ${params.value}` : "🟢 OK",
    },
    {
      field: "totalValue",
      headerName: "Total Value (RSD)",
      width: 180,
      align: "right",
      headerAlign: "right",
      valueFormatter: (params) =>
        params.value ? params.value.toLocaleString("sr-RS") + " RSD" : "0 RSD",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleDetails(params.row.id)}
        >
          Details
        </Button>
      ),
    },
  ];

  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box p={3} sx={{ overflow: "hidden" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          label="Filter by name"
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          height={500}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <DataGrid
            rows={filteredWarehouses}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            autoHeight={false}
            sx={{
              minWidth: 800,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
