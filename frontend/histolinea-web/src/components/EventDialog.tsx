import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
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
    startDate: string; // ISO string para backend
    endDate: string | null; // ISO o null
    imageUrl: string | null;
    sourceUrl: string | null;
  }) => Promise<void>;
};

export default function EventDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const titleText = useMemo(
    () => (mode === "create" ? "Crear evento" : "Editar evento"),
    [mode]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(""); // yyyy-mm-dd
  const [endDate, setEndDate] = useState(""); // yyyy-mm-dd
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStartDate(initial?.startDate ?? "");
    setEndDate(initial?.endDate ?? "");
    setImageUrl(initial?.imageUrl ?? "");
    setSourceUrl(initial?.sourceUrl ?? "");
  }, [open, initial]);

  function toIso(dateOnly: string) {
    if (!dateOnly) return "";
    return `${dateOnly}T00:00:00`;
  }

  async function handleSave() {
    if (!title.trim()) {
      alert("El título es obligatorio");
      return;
    }
    if (!startDate) {
      alert("La fecha de inicio es obligatoria");
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
      <DialogTitle>{titleText}</DialogTitle>

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
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
          />

          <TextField
            label="Source URL"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
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