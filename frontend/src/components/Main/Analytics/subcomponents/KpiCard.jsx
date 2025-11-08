import { Card, CardContent, Box, Typography } from "@mui/material";

export default function KpiCard({ title, value, icon = null, subtitle }) {
  return (
    <Card
      sx={{
        flex: 1,
        height: "100%",
        borderRadius: 3,
        backdropFilter: "blur(6px)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.24)",
        },
      }}
    >
      <CardContent
        sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.25 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="subtitle2"
            sx={{ color: "text.secondary", letterSpacing: ".02em" }}
          >
            {title}
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
