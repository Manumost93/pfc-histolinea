import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";

import { http } from "../api/http";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import EventDialog from "../components/EventDialog";

type EventPayload = {
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
};

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export default function TimelinePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);

  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const eventsRef = useRef<HistoricalEvent[]>([]);

  const [selected, setSelected] = useState<HistoricalEvent | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    title: string;
  }>({ open: false, id: null, title: "" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  async function load() {
    try {
      const res = await http.get<HistoricalEvent[]>("/api/Events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error cargando eventos" });
      setEvents([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Create timeline once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const timeline = new Timeline(container, new DataSet([]), {
      stack: true,
      horizontalScroll: true,
      zoomKey: "ctrlKey",
      maxHeight: 470,
      zoomMin: 1000 * 60 * 60 * 24 * 30,
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 800,
      margin: { item: 10 },
    });

    timeline.on("select", (props: any) => {
      const id = props.items?.[0];
      if (!id) return;

      const ev = eventsRef.current.find((x) => x.id === id);
      if (!ev) return;

      setSelected(ev);
      setViewOpen(true);
    });

    timelineRef.current = timeline;

    return () => {
      timeline.destroy();
      timelineRef.current = null;
      container.replaceChildren();
    };
  }, []);

  // Items: show thumbnail + title (HTML)
  const items = useMemo(() => {
    return new DataSet(
      events.map((e) => {
        const title = escapeHtml(e.title);
        const hasImg = !!e.imageUrl;
        const img = hasImg
          ? `<img src="${e.imageUrl}" style="width:22px;height:22px;border-radius:6px;object-fit:cover;border:1px solid rgba(122,79,42,0.25);" />`
          : `<span style="width:22px;height:22px;border-radius:6px;display:inline-block;background:rgba(122,79,42,0.18);border:1px solid rgba(122,79,42,0.25)"></span>`;

        const content = `
          <div style="display:flex;align-items:center;gap:8px;line-height:1;">
            ${img}
            <span style="font-weight:700;">${title}</span>
          </div>
        `;

        return {
          id: e.id,
          content,
          start: e.startDate,
          end: e.endDate || undefined,
          title: escapeHtml(e.description || e.title),
        };
      })
    );
  }, [events]);

  useEffect(() => {
    if (!timelineRef.current) return;
    timelineRef.current.setItems(items);
    if (events.length > 0) timelineRef.current.fit({ animation: { duration: 250 } });
  }, [items, events.length]);

  function openCreate() {
    setSelected(null);
    setCreateOpen(true);
  }

  function openEditFromView() {
    if (!selected) return;
    setViewOpen(false);
    setEditOpen(true);
  }

  function openDeleteFromView() {
    if (!selected) return;
    setDeleteDialog({ open: true, id: selected.id, title: selected.title });
  }

  async function confirmDelete() {
    if (!deleteDialog.id) return;

    try {
      await http.delete(`/api/Events/${deleteDialog.id}`);
      await load();
      setSnackbar({ open: true, severity: "success", message: "Evento eliminado" });

      setDeleteDialog({ open: false, id: null, title: "" });
      setViewOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error eliminando evento" });
    }
  }

  async function submitEdit(payload: EventPayload) {
    if (!selected) throw new Error("No hay evento seleccionado");

    try {
      await http.put(`/api/Events/${selected.id}`, payload);
      await load();
      setSnackbar({ open: true, severity: "success", message: "Evento actualizado" });
      setEditOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error guardando evento" });
      throw err;
    }
  }

  async function submitCreate(payload: EventPayload) {
    try {
      await http.post("/api/Events", payload);
      await load();
      setSnackbar({ open: true, severity: "success", message: "Evento creado" });
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error creando evento" });
      throw err;
    }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} sx={{ px: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Timeline histórica
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ctrl + rueda = zoom · Click en un evento para ver detalles
          </Typography>
        </Box>

        <Button variant="contained" size="large" onClick={openCreate}>
          Crear evento
        </Button>
      </Stack>

      <Box
        ref={containerRef}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 2,
          p: 1,
          height: 470,
          overflow: "hidden",
        }}
      />

      {/* VIEW */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{selected?.title}</DialogTitle>
        <DialogContent dividers>
          {selected?.imageUrl ? (
            <Box
              component="img"
              src={selected.imageUrl}
              alt={selected.title}
              sx={{
                width: "100%",
                maxHeight: 260,
                objectFit: "cover",
                borderRadius: 2,
                mb: 2,
                boxShadow: 1,
              }}
            />
          ) : null}

          <Typography sx={{ mb: 2 }}>
            {selected?.description || "Sin descripción"}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Inicio: <b>{selected?.startDate}</b>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fin: <b>{selected?.endDate || "-"}</b>
            </Typography>
          </Stack>

          {selected?.sourceUrl && (
            <Typography variant="body2">
              Fuente:{" "}
              <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                {selected.sourceUrl}
              </a>
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          <Button color="error" onClick={openDeleteFromView}>
            Borrar
          </Button>
          <Button variant="contained" onClick={openEditFromView}>
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* CREATE */}
      <EventDialog
        open={createOpen}
        mode="create"
        initial={null}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
      />

      {/* EDIT */}
      <EventDialog
        open={editOpen}
        mode="edit"
        initial={selected}
        onClose={() => setEditOpen(false)}
        onSubmit={submitEdit}
      />

      {/* DELETE CONFIRM */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          ¿Seguro que quieres borrar <b>{deleteDialog.title}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: "" })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Borrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}