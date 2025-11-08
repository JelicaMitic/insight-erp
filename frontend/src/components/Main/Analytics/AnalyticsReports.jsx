import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  getSalesByWarehouse,
  getTopProducts,
  getOverview,
  getSalesTrend,
} from "./services/analytics";

const REPORTS = [
  { id: "byCustomer", label: "Prodaja po kupcu i skladištu" },
  { id: "topProducts", label: "Top artikli po vrednosti i količini" },
  { id: "stockTurnover", label: "Promet i zalihe po proizvodu" },
  { id: "leadTime", label: "Lead time po kupcu" },
  { id: "profitByCategory", label: "Marža po kategoriji proizvoda" },
];

export default function AnalyticsReports() {
  const [selectedReport, setSelectedReport] = useState("topProducts");
  const [range, setRange] = useState({
    from: dayjs().startOf("month").toDate(),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const loadReport = async () => {
    setLoading(true);
    try {
      switch (selectedReport) {
        case "topProducts": {
          const data = await getTopProducts(range.from, range.to);
          setColumns([
            { field: "name", headerName: "Proizvod", flex: 1 },
            { field: "quantity", headerName: "Količina", width: 120 },
            {
              field: "revenue",
              headerName: "Vrednost prodaje (€)",
              width: 180,
              valueFormatter: (p) => p.value.toFixed(2),
            },
          ]);
          setRows(data);
          break;
        }
        case "byCustomer": {
          const data = await getSalesByWarehouse(range.from, range.to);
          setColumns([
            { field: "warehouseName", headerName: "Skladište", flex: 1 },
            {
              field: "revenue",
              headerName: "Prodaja (€)",
              width: 150,
              valueFormatter: (p) => p.value.toFixed(2),
            },
          ]);
          setRows(data);
          break;
        }
        default: {
          const data = await getOverview(range.from, range.to);
          setColumns([
            { field: "metric", headerName: "Pokazatelj", flex: 1 },
            { field: "value", headerName: "Vrednost", width: 150 },
          ]);
          setRows([
            {
              id: 1,
              metric: "Ukupna prodaja",
              value: `${data.totalSales.toFixed(2)} €`,
            },
            { id: 2, metric: "Porudžbine", value: data.totalOrders },
            { id: 3, metric: "Kupci", value: data.uniqueCustomers },
            {
              id: 4,
              metric: "Artikli sa niskim zalihama",
              value: data.lowStockCount,
            },
          ]);
          break;
        }
      }
    } catch (err) {
      toast.error(err.message || "Greška pri učitavanju izveštaja.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [selectedReport, range]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        📊 Analitički izveštaji
      </Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          select
          label="Izveštaj"
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        >
          {REPORTS.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Od"
          size="small"
          value={dayjs(range.from).format("YYYY-MM-DD")}
          onChange={(e) => setRange({ ...range, from: e.target.value })}
        />
        <TextField
          type="date"
          label="Do"
          size="small"
          value={dayjs(range.to).format("YYYY-MM-DD")}
          onChange={(e) => setRange({ ...range, to: e.target.value })}
        />

        <Button variant="outlined" onClick={loadReport} disabled={loading}>
          🔄 Osveži
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => toast.success("Izvoz u Excel još nije implementiran.")}
        >
          📤 Exportuj
        </Button>
      </Stack>

      <Box
        sx={{
          height: 500,
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
          >
            <CircularProgress />
          </Stack>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </Box>
    </Box>
  );
}
