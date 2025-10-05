import { Grid, Card, CardContent, Typography } from "@mui/material";

function KpiCard({ title, value, caption }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="overline">{title}</Typography>
        <Typography variant="h4" sx={{ my: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="Total Sales" value="—" caption="Today test" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="Orders" value="—" caption="Last 24h" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="Items Sold" value="—" caption="This month" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <KpiCard title="Top Product" value="—" caption="—" />
      </Grid>
    </Grid>
  );
}
// export default function Dashboard() {
//   return <div>Dashboard radi 🎉</div>;
// }
