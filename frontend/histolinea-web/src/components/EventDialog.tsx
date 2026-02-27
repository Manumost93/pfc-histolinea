import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Box,
  Typography,
} from "@mui/material";
import type { HistoricalEvent } from "../types/HistoricalEvent";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: HistoricalEvent | null;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    imageUrl: string | null;
    sourceUrl: string | null;
  }) => Promise<void>;
};

function isValidUrl(s: string) {
  if (!s.trim()) return true;
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export default function EventDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const titleText = useMemo(() => (mode === "create" ? "Crear evento" : "Editar evento"), [mode]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setImageUrl(initial?.imageUrl ?? "");
    setSourceUrl(initial?.sourceUrl ?? "");
    setImgOk(true);
  }, [open, initial]);

  function toIso(dateOnly: string) {
    if (!dateOnly) return "";
    return `${dateOnly}T00:00:00`;
  }

  const imageUrlError = !isValidUrl(imageUrl) ? "URL inválida" : "";
  const sourceUrlError = !isValidUrl(sourceUrl) ? "URL inválida" : "";

  async function handleSave() {
    if (!title.trim()) {
      alert("El título es obligatorio");
      return;
    }
    if (!startDate) {
      alert("La fecha de inicio es obligatoria");
      return;
    }
    if (imageUrlError || sourceUrlError) {
      alert("Revisa las URLs (no son válidas).");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        startDate: toIso(startDate),
        endDate: endDate ? toIso(endDate) : null,
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
        sourceUrl: sourceUrl.trim() ? sourceUrl.trim() : null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 950 }}>{titleText}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            fullWidth
          />

          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Inicio *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImgOk(true);
            }}
            error={!!imageUrlError}
            helperText={imageUrlError || "Se mostrará una miniatura en la timeline y un banner en detalle."}
            fullWidth
          />

          {/* Preview imagen */}
          {imageUrl.trim() ? (
            <Box
              sx={{
                width: "100%",
                height: 180,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(122,79,42,0.15)",
                bgcolor: "rgba(122,79,42,0.06)",
              }}
            >
              {imgOk ? (
                <Box
                  component="img"
                  src={imageUrl}
                  alt="preview"
                  onError={() => setImgOk(false)}
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">
                    No se pudo cargar la imagen (URL o CORS).
                  </Typography>
                </Stack>
              )}
            </Box>
          ) : null}

          <TextField
            label="Source URL"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            error={!!sourceUrlError}
            helperText={sourceUrlError || "Enlace a Wikipedia, libro, artículo, etc."}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {mode === "create" ? "Crear" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}