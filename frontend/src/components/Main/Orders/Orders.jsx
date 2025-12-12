import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import toast from "react-hot-toast";
import {
  getOrdersService,
  generateInvoiceService,
  downloadInvoicePdfService,
} from "./services/orders";
import OrderForm from "./OrderForm";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrdersService();

      console.log(data);
      setOrders(data);
    } catch (err) {
      toast.error(err.message || "Greška pri učitavanju porudžbina.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleGenerateInvoice = async (orderId) => {
    try {
      await generateInvoiceService(orderId);
      toast.success("Faktura uspešno generisana!");
      loadOrders();
    } catch (err) {
      toast.error(err.message || "Greška pri generisanju fakture.");
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "date",
      headerName: "Datum",
      width: 180,
      valueGetter: (params) => params || "",
      renderCell: (params) => {
        const raw = params?.value;
        if (!raw) return "";

        try {
          let clean = raw;
          if (typeof clean === "string" && clean.includes(".")) {
            clean = clean.split(".")[0];
          }
          if (typeof clean === "string" && !clean.endsWith("Z")) {
            clean += "Z";
          }

          const d = new Date(clean);
          return !isNaN(d.getTime())
            ? d.toLocaleDateString("sr-RS", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "";
        } catch {
          return "";
        }
      },
    },

    { field: "customerName", headerName: "Kupac", flex: 1 },

    {
      field: "totalAmount",
      headerName: "Ukupno (RSD)",
      width: 160,
      valueFormatter: (params) =>
        params.value?.toLocaleString("sr-RS", { minimumFractionDigits: 2 }),
    },
    {
      field: "invoiceStatus",
      headerName: "Status fakture",
      width: 150,
      renderCell: (params) => {
        const status = params.value || "Pending";
        const color =
          status === "Issued"
            ? "success"
            : status === "Paid"
            ? "info"
            : "warning";
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Akcije",
      width: 220,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<ReceiptLongIcon />}
              disabled={row.invoiceStatus === "Issued"}
              onClick={() => handleGenerateInvoice(row.id)}
            >
              Fakturiši
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<PictureAsPdfIcon />}
              onClick={async () => {
                try {
                  await downloadInvoicePdfService(row.invoiceId);
                } catch (err) {
                  toast.error(err.message || "Greška pri preuzimanju PDF-a.");
                }
              }}
              disabled={!row.invoiceStatus}
            >
              PDF
            </Button>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Nova porudžbina
        </Button>
      </Stack>

      {loading ? (
        <Stack alignItems="center" mt={5}>
          <CircularProgress />
        </Stack>
      ) : (
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={orders.map((o) => ({
              ...o,
              customerName: o.customer?.name || o.customerName,
            }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20]}
            disableRowSelectionOnClick
          />
        </Box>
      )}

      <OrderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={async () => {
          setOpenForm(false);
          await loadOrders();
        }}
      />
    </Box>
  );
}
