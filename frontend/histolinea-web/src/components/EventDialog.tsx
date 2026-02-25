import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  CircularProgress,
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

export default function EventDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const titleText = useMemo(
    () => (mode === "create" ? "Crear evento" : "Editar evento"),
    [mode]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({
    title: "",
    startDate: "",
    endDate: "",
    imageUrl: "",
    sourceUrl: "",
  });

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setImageUrl(initial?.imageUrl ?? "");
    setSourceUrl(initial?.sourceUrl ?? "");

    setErrors({
      title: "",
      startDate: "",
      endDate: "",
      imageUrl: "",
      sourceUrl: "",
    });
  }, [open, initial]);

  function toIso(dateOnly: string) {
    if (!dateOnly) return "";
    return `${dateOnly}T00:00:00`;
  }

  function validate() {
    const newErrors = {
      title: "",
      startDate: "",
      endDate: "",
      imageUrl: "",
      sourceUrl: "",
    };

    if (!title.trim()) newErrors.title = "El título es obligatorio";
    if (!startDate) newErrors.startDate = "La fecha de inicio es obligatoria";
    if (endDate && startDate && endDate < startDate) {
      newErrors.endDate = "La fecha fin no puede ser anterior a inicio";
    }

    const urlRegex = /^https?:\/\/.+/i;
    if (imageUrl && !urlRegex.test(imageUrl)) newErrors.imageUrl = "URL no válida";
    if (sourceUrl && !urlRegex.test(sourceUrl)) newErrors.sourceUrl = "URL no válida";

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  }

  async function handleSave() {
    if (!validate()) return;

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
      <DialogTitle sx={{ fontWeight: 800 }}>{titleText}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
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
              error={!!errors.startDate}
              helperText={errors.startDate}
            />
            <TextField
              label="Fin"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              error={!!errors.endDate}
              helperText={errors.endDate}
            />
          </Stack>

          <TextField
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            error={!!errors.imageUrl}
            helperText={errors.imageUrl}
          />

          <TextField
            label="Source URL"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            fullWidth
            error={!!errors.sourceUrl}
            helperText={errors.sourceUrl}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {saving ? "Guardando..." : mode === "create" ? "Crear" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}