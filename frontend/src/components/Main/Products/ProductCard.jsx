import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ProductCard({ product, onEdit, onDelete, onDetails }) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        height: 250,
        width: "100%",
        maxWidth: 280,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        },
        transition: "all 0.2s ease",
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.8em",
          }}
        >
          {product.description || "Bez opisa"}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
          }).format(product.price)}
        </Typography>

        <Chip
          label={`Na stanju: ${product.stockQuantity}`}
          size="small"
          variant="outlined"
          sx={{
            alignSelf: "flex-start",
            fontWeight: 600,
            borderColor: "rgba(255,255,255,0.2)",
          }}
        />
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "flex-end",
          pt: 0,
          pb: 0.5,
          gap: 0.5,
        }}
      >
        <Tooltip title="Detalji">
          <IconButton
            onClick={() => onDetails(product.id)}
            aria-label="details"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Izmeni">
          <IconButton onClick={() => onEdit(product)} aria-label="edit">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Obriši">
          <IconButton
            color="error"
            onClick={() => onDelete(product.id)}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
