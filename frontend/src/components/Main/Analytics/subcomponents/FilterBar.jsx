// ./subcomponents/FilterBar.jsx
import { Box, Button, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

export default function FilterBar({
  mode,
  days,
  from,
  to,
  onPreset,
  onCustomChange,
  onApplyCustom,
  onRefresh,
  canRefresh,
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  // uskladi lokalna polja kad props promene dođu spolja
  useEffect(() => setLocalFrom(from), [from]);
  useEffect(() => setLocalTo(to), [to]);

  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <Stack direction="row" spacing={1}>
        <Button
          variant={mode === "preset" && days === 7 ? "contained" : "outlined"}
          onClick={() => onPreset(7)}
        >
          7 dana
        </Button>
        <Button
          variant={mode === "preset" && days === 30 ? "contained" : "outlined"}
          onClick={() => onPreset(30)}
        >
          30 dana
        </Button>
        <Button
          variant={mode === "preset" && days === 365 ? "contained" : "outlined"}
          onClick={() => onPreset(365)}
        >
          365 dana
        </Button>
        <Button
          variant={mode === "custom" ? "contained" : "outlined"}
          onClick={() => onPreset("custom")}
        >
          Custom
        </Button>
      </Stack>

      {mode === "custom" && (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            type="date"
            size="small"
            label="Od"
            value={dayjs(localFrom).format("YYYY-MM-DD")}
            onChange={(e) => {
              const v = dayjs(e.target.value).toDate();
              setLocalFrom(v);
              onCustomChange?.({ from: v, to: localTo });
            }}
          />
          <TextField
            type="date"
            size="small"
            label="Do"
            value={dayjs(localTo).format("YYYY-MM-DD")}
            onChange={(e) => {
              const v = dayjs(e.target.value).toDate();
              setLocalTo(v);
              onCustomChange?.({ from: localFrom, to: v });
            }}
          />
          <Button
            variant="contained"
            onClick={() => onApplyCustom?.(localFrom, localTo)}
          >
            Primeni
          </Button>
        </Stack>
      )}

      <Box flexGrow={1} />
      {canRefresh && (
        <Button variant="outlined" onClick={onRefresh}>
          🔄 Osveži analitiku
        </Button>
      )}
    </Box>
  );
}
