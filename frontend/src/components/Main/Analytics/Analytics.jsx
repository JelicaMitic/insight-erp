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

  const loadAll = async () => {
    try {
      let ov, tr, wh, tp;

      if (mode === "preset") {
        [ov, tr, wh, tp] = await Promise.all([
          getOverviewPreset(presetDays),
          getSalesTrendPreset(presetDays),
          getSalesByWarehousePreset(presetDays),
          getTopProductsPreset(presetDays),
        ]);
      } else {
        [ov, tr, wh, tp] = await Promise.all([
          getOverview(range.from, range.to),
          getSalesTrend(range.from, range.to),
          getSalesByWarehouse(range.from, range.to),
          getTopProducts(range.from, range.to),
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
  }, [mode, presetDays, range.from, range.to]);

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
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/analytics/reports")}
          sx={{ ml: "auto" }} // gura ga na desnu stranu
        >
          📊 Open Reports Page
        </Button>
      </Box>

      {overview && (
        <Grid container spacing={2} my={2}>
          <Grid item xs={12} md={3} justifyContent="center">
            <KpiCard
              title="Total sales"
              value={`${overview.totalSales.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} €`}
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
              title="Unique customers"
              value={overview.uniqueCustomers}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <KpiCard
              title="Low stock items"
              value={overview.lowStockCount}
              color="#f44336"
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
        <WarehouseBarChart data={warehouses} />
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
