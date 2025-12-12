import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function ProductCard({ product, onEdit, onDelete, onDetails }) {
  return (
    <Card
      sx={{
        flex: 1,
        width: "14rem",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#111827",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        transition: "all 0.2s ease",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 1,
          p: 1.5,
        }}
      >
        <Typography
          variant="subtitle1"
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

        <Stack direction="row" spacing={1}>
          <Chip
            label="Na stanju"
            color="success"
            size="small"
            sx={{ fontWeight: 500 }}
          />
          {product.categoryName && (
            <Chip
              label={product.categoryName}
              color="info"
              size="small"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Stack>

        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "1.2rem",
          }}
        >
          {new Intl.NumberFormat("sr-RS", {
            style: "currency",
            currency: "RSD",
            minimumFractionDigits: 2,
          }).format(product.price)}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "flex-end",
          py: 1,
          px: 1.5,
          gap: 0.5,
          mt: "auto",
        }}
      >
        <Tooltip title="Detalji">
          <IconButton
            onClick={() => onDetails(product.id)}
            aria-label="details"
            size="small"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Izmeni">
          <IconButton
            onClick={() => onEdit(product)}
            aria-label="edit"
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Obriši">
          <IconButton
            color="error"
            onClick={() => onDelete(product.id)}
            aria-label="delete"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
