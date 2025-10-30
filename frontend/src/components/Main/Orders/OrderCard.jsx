import {
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptIcon from "@mui/icons-material/Receipt";

export default function OrderCard({ order, onDetails, onInvoice }) {
  const formattedDate = new Date(order.date).toLocaleDateString("sr-RS");

  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.03)",
        color: "white",
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Porudžbina #{order.id}</Typography>
          <Chip
            label={order.invoiceStatus || "Bez fakture"}
            color={order.invoiceStatus ? "success" : "default"}
            size="small"
          />
        </Stack>

        <Typography variant="body2" color="gray" sx={{ mt: 1 }}>
          Datum: {formattedDate}
        </Typography>
        <Typography variant="body2">
          Kupac: {order.customerName || "Nepoznat"}
        </Typography>
        <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
          Iznos: {order.totalAmount.toFixed(2)} RSD
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <IconButton size="small" onClick={() => onDetails(order)}>
            <VisibilityIcon sx={{ color: "white" }} />
          </IconButton>
          {!order.invoiceStatus && (
            <IconButton size="small" onClick={() => onInvoice(order.id)}>
              <ReceiptIcon sx={{ color: "white" }} />
            </IconButton>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
