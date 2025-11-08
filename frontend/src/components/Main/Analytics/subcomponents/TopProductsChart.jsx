import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TopProductsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart layout="vertical" data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={120} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#ff9800" />
      </BarChart>
    </ResponsiveContainer>
  );
}
