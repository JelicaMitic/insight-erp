import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box } from "@mui/material";

export default function WarehouseBarChart({ data }) {
  return (
    <Box sx={{ height: 320, overflow: "visible" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 12, left: 24 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="warehouseName" tickMargin={8} minTickGap={12} />
          <YAxis
            width={72}
            tickMargin={8}
            tickFormatter={(v) => v.toLocaleString("sr-RS")}
          />
          <Tooltip
            formatter={(val) => [
              `${Number(val).toLocaleString("sr-RS")} €`,
              "Revenue",
            ]}
            labelFormatter={(name) => `Warehouse: ${name}`}
          />
          <Bar dataKey="revenue" fill="#4caf50" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
