import { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import FilterBar from "./subcomponents/FilterBar";
import KpiCard from "./subcomponents/KpiCard";
import SalesTrendChart from "./subcomponents/SalesTrendChart";
import WarehouseBarChart from "./subcomponents/WarehouseBarChart";
import TopProductsChart from "./subcomponents/TopProductsChart";
import {
  getOverview,
  getSalesTrend,
  getSalesByWarehouse,
  getTopProducts,
  getOverviewPreset,
  getSalesTrendPreset,
  getSalesByWarehousePreset,
  getTopProductsPreset,
  runEtl,
} from "./services/analytics";
import { useAuthStore } from "../../../store/auth";

export default function Analytics() {
  const [mode, setMode] = useState("preset"); // "preset" | "custom"
  const [presetDays, setPresetDays] = useState(7);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const navigate = useNavigate();

  const [range, setRange] = useState({
    from: dayjs().startOf("month").toDate(),
    to: new Date(),
  });

  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const canRefresh = useAuthStore((s) => s.hasRole(["Admin"]));

  const fmtCurrency = (n) =>
    (n ?? 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const loadAll = async () => {
    try {
      let ov, tr, wh, tp;
      const whId = selectedWarehouse?.warehouseId ?? null;

      if (mode === "preset") {
        [ov, tr, wh, tp] = await Promise.all([
          getOverviewPreset(presetDays, whId),
          getSalesTrendPreset(presetDays, whId),
          getSalesByWarehousePreset(presetDays),
          getTopProductsPreset(presetDays, whId),
        ]);
      } else {
        [ov, tr, wh, tp] = await Promise.all([
          getOverview(range.from, range.to, whId),
          getSalesTrend(range.from, range.to, whId),
          getSalesByWarehouse(range.from, range.to),
          getTopProducts(range.from, range.to, whId),
        ]);
      }

      setOverview(ov);
      setTrend(tr.map((t) => ({ date: t.date.split("T")[0], sales: t.sales })));
      setWarehouses(wh);
      setTopProducts(tp);
    } catch (err) {
      toast.error(err.message || "Greška pri učitavanju analitike.");
    }
  };

  useEffect(() => {
    loadAll();
  }, [mode, presetDays, range.from, range.to, selectedWarehouse?.warehouseId]);

  const handlePreset = (val) => {
    if (val === "custom") {
      setMode("custom");
      return;
    }
    setMode("preset");
    setPresetDays(val); // 7 | 30 | 365
  };

  const handleCustomChange = ({ from, to }) => {
    setRange({ from, to });
  };

  const handleApplyCustom = (from, to) => {
    setMode("custom");
    setRange({ from, to });
  };

  const handleEtl = async () => {
    try {
      let from = range.from;
      let to = range.to;

      if (mode === "preset") {
        to = new Date();
        from = dayjs(to).subtract(presetDays, "day").toDate();
      }

      console.log("Pokrećem ETL za period:", from, "→", to);

      const res = await runEtl(from, to);
      toast.success(`ETL pokrenut (${res?.written ?? 0} zapisa).`);
      await loadAll();
    } catch (err) {
      toast.error(err.message || "Greška pri pokretanju ETL-a.");
    }
  };

  return (
    <Box p={3}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 550 }}>Filter by:</Typography>

        <FilterBar
          mode={mode}
          days={presetDays}
          from={range.from}
          to={range.to}
          onPreset={handlePreset}
          onCustomChange={handleCustomChange}
          onApplyCustom={handleApplyCustom}
          onRefresh={handleEtl}
          canRefresh={canRefresh}
        />
      </Box>

      {selectedWarehouse && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">
            Filtered by warehouse: <b>{selectedWarehouse.warehouseName}</b>
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelectedWarehouse(null)}
          >
            Clear
          </Button>
        </Box>
      )}

      {overview && (
        <Grid container spacing={2} my={2}>
          <Grid item xs={12} md={3} justifyContent="center">
            <KpiCard
              title="Total sales"
              value={`${overview.totalSales.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} RSD`}
              color="#1976d2"
            />
          </Grid>

          <Grid item xs={12} md={3} justifyContent="center">
            <KpiCard
              title="Total orders"
              value={overview.totalOrders}
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <KpiCard
              title="Low stock items"
              value={overview.lowStockCount}
              color="#f44336"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KpiCard
              title="Average order value"
              value={`${fmtCurrency(overview.averageOrderValue)} RSD`}
              subtitle="= Total sales / Total orders"
            />
          </Grid>
        </Grid>
      )}

      <Box my={3}>
        <Typography variant="h6" mb={1}>
          📈 Sales trend
        </Typography>
        <SalesTrendChart data={trend} />
      </Box>

      <Box my={3}>
        <Typography variant="h6" mb={1}>
          🏭 Sales by warehouse
        </Typography>
        <WarehouseBarChart
          data={warehouses}
          selectedWarehouseId={selectedWarehouse?.warehouseId ?? null}
          onSelectWarehouse={(w) => setSelectedWarehouse(w)}
        />
      </Box>

      <Box my={3}>
        <Typography variant="h6" mb={1}>
          🏆 Top products
        </Typography>
        <TopProductsChart data={topProducts} />
      </Box>
    </Box>
  );
}
