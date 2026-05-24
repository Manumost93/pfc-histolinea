import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import { getEraByStartDate } from "../utils/era";

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

const ERA_COLORS: Record<string, string> = {
  ancient: "#2e7d32",
  medieval: "#6d4c41",
  modern: "#1565c0",
  contemporary: "#6a1b9a",
};

function isValidUrl(s: string) {
  if (!s.trim()) return true;
  try { new URL(s); return true; } catch { return false; }
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
  const [errors, setErrors] = useState<{
    title?: string;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
    sourceUrl?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setImageUrl(initial?.imageUrl ?? "");
    setSourceUrl(initial?.sourceUrl ?? "");
    setImgOk(true);
    setErrors({});
  }, [open, initial]);

  function toIso(dateOnly: string) {
    if (!dateOnly) return "";
    return `${dateOnly}T00:00:00`;
  }

  const imageUrlError = !isValidUrl(imageUrl) ? "URL inválida" : "";
  const sourceUrlError = !isValidUrl(sourceUrl) ? "URL inválida" : "";

  const eraPreview = useMemo(() => {
    if (!startDate) return null;
    return getEraByStartDate(startDate);
  }, [startDate]);

  async function handleSave() {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "El título es obligatorio";
    if (!startDate) nextErrors.startDate = "La fecha de inicio es obligatoria";
    if (imageUrlError) nextErrors.imageUrl = imageUrlError;
    if (sourceUrlError) nextErrors.sourceUrl = sourceUrlError;
    if (startDate && endDate && endDate < startDate) {
      nextErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
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
      <DialogTitle sx={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 1.5 }}>
        {titleText}
        {eraPreview && (
          <Chip
            size="small"
            label={eraPreview.label}
            sx={{
              bgcolor: ERA_COLORS[eraPreview.key],
              color: "#fff",
              fontWeight: 700,
              fontSize: 11,
              ml: "auto",
            }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>

          <TextField
            label="Título *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={!!errors.title}
            helperText={errors.title}
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
              onChange={(e) => {
                setStartDate(e.target.value);
                setErrors((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
              }}
              error={!!errors.startDate}
              helperText={errors.startDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setErrors((prev) => ({ ...prev, endDate: undefined }));
              }}
              error={!!errors.endDate}
              helperText={errors.endDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Divider />

          <TextField
            label="URL de imagen"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImgOk(true);
              setErrors((prev) => ({ ...prev, imageUrl: undefined }));
            }}
            error={!!imageUrlError || !!errors.imageUrl}
            helperText={
              errors.imageUrl ?? imageUrlError ?? "Opcional · Se mostrará miniatura en la timeline."
            }
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
            label="URL de fuente"
            value={sourceUrl}
            onChange={(e) => {
              setSourceUrl(e.target.value);
              setErrors((prev) => ({ ...prev, sourceUrl: undefined }));
            }}
            error={!!sourceUrlError || !!errors.sourceUrl}
            helperText={
              errors.sourceUrl ?? sourceUrlError ?? "Opcional · Wikipedia, libro, artículo, etc."
            }
            fullWidth
          />

        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {mode === "create" ? "Crear" : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
