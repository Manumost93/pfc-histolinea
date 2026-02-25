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

type EraKey = "ancient" | "medieval" | "modern" | "contemporary";

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeAttr(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function yearFromDateOnly(dateOnly: string): number | null {
  // dateOnly esperado "YYYY-MM-DD"
  if (!dateOnly || dateOnly.length < 4) return null;
  const y = Number(dateOnly.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

function getEra(year: number): { key: EraKey; label: string; className: string; dot: string } {
  // Criterio simple (ajustable):
  // Antigua: < 476
  // Medieval: 476 - 1491
  // Moderna: 1492 - 1788
  // Contemporánea: >= 1789
  if (year < 476) return { key: "ancient", label: "Antigua", className: "era-ancient", dot: "rgba(46,125,50,0.9)" };
  if (year < 1492) return { key: "medieval", label: "Medieval", className: "era-medieval", dot: "rgba(109,76,65,0.95)" };
  if (year < 1789) return { key: "modern", label: "Moderna", className: "era-modern", dot: "rgba(21,101,192,0.9)" };
  return { key: "contemporary", label: "Contemporánea", className: "era-contemporary", dot: "rgba(106,27,154,0.9)" };
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

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null as string | null,
    title: "",
  });

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
      setEvents([]);
      setSnackbar({ open: true, severity: "error", message: "Error cargando eventos" });
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Crear timeline una sola vez
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const timeline = new Timeline(container, new DataSet([]), {
      stack: true,
      horizontalScroll: true,
      zoomKey: "ctrlKey",
      maxHeight: 540,
      margin: { item: 12 },
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

  // Groups por época
  const groups = useMemo(() => {
    const ds = new DataSet([
      { id: "ancient", content: "Antigua", className: "era-ancient" },
      { id: "medieval", content: "Medieval", className: "era-medieval" },
      { id: "modern", content: "Moderna", className: "era-modern" },
      { id: "contemporary", content: "Contemporánea", className: "era-contemporary" },
    ]);
    return ds;
  }, []);

  // Items con miniatura uniforme + marcador (dot) + tooltip con imagen grande
  const items = useMemo(() => {
    return new DataSet(
      events.map((e) => {
        const y = yearFromDateOnly(e.startDate) ?? 0;
        const era = getEra(y);

        const title = escapeHtml(e.title);
        const safeUrl = e.imageUrl ? escapeAttr(e.imageUrl) : null;

        // Thumbnail fijo 34x34 (uniforme)
        const thumb = safeUrl
          ? `
            <span style="width:34px;height:34px;display:inline-block;flex:0 0 34px;border-radius:8px;overflow:hidden;border:1px solid rgba(122,79,42,0.25);background:rgba(122,79,42,0.08)">
              <img src="${safeUrl}" style="width:100%;height:100%;display:block;object-fit:cover;" />
            </span>
          `
          : `
            <span style="width:34px;height:34px;border-radius:8px;display:inline-block;flex:0 0 34px;background:rgba(122,79,42,0.18);border:1px solid rgba(122,79,42,0.25)"></span>
          `;

        // Marker dot (mejor “punto” visual)
        const dot = `
          <span style="width:10px;height:10px;border-radius:999px;display:inline-block;background:${era.dot};box-shadow:0 0 0 3px rgba(255,255,255,0.9);border:1px solid rgba(0,0,0,0.08)"></span>
        `;

        const content = `
          <div style="display:flex;align-items:center;gap:10px;">
            ${dot}
            ${thumb}
            <span style="font-weight:800;line-height:1.1;">${title}</span>
          </div>
        `;

        const tooltip = `
          <div style="max-width:360px;">
            ${
              safeUrl
                ? `<img src="${safeUrl}" style="width:100%;height:170px;object-fit:cover;border-radius:12px;display:block;margin-bottom:10px;" />`
                : ""
            }
            <div style="font-weight:900;margin-bottom:6px;">${title}</div>
            <div style="opacity:.85;">${escapeHtml(e.description || "Sin descripción")}</div>
            <div style="margin-top:10px;opacity:.75;font-size:12px;">
              <b>${escapeHtml(e.startDate)}</b>${e.endDate ? " → <b>" + escapeHtml(e.endDate) + "</b>" : ""}
              · Época: <b>${escapeHtml(era.label)}</b>
            </div>
          </div>
        `;

        return {
          id: e.id,
          group: era.key,
          className: era.className, // colorea borde según época
          content,
          start: e.startDate,
          end: e.endDate || undefined,
          title: tooltip,
        };
      })
    );
  }, [events]);

  // Aplicar groups + items al timeline
  useEffect(() => {
    if (!timelineRef.current) return;
    timelineRef.current.setGroups(groups);
    timelineRef.current.setItems(items);
    if (events.length > 0) timelineRef.current.fit({ animation: { duration: 250 } });
  }, [groups, items, events.length]);

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

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ px: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={900}>
            Timeline histórica
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ctrl + rueda = zoom · Pasa el ratón para ver imagen · Click para detalles
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
          borderRadius: 3,
          boxShadow: 3,
          p: 1,
          height: 540,
          overflow: "hidden",
        }}
      />

      {/* VIEW */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>{selected?.title}</DialogTitle>
        <DialogContent dividers>
          {selected?.imageUrl ? (
            <Box
              sx={{
                width: "100%",
                height: 280,
                borderRadius: 2,
                overflow: "hidden",
                mb: 2,
                border: "1px solid rgba(122,79,42,0.15)",
                bgcolor: "rgba(122,79,42,0.06)",
              }}
            >
              <Box
                component="img"
                src={selected.imageUrl}
                alt={selected.title}
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          ) : null}

          <Typography sx={{ mb: 2 }}>{selected?.description || "Sin descripción"}</Typography>

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

      {/* DELETE */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}>
        <DialogTitle sx={{ fontWeight: 900 }}>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          ¿Seguro que quieres borrar <b>{deleteDialog.title}</b>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: "" })}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Borrar
          </Button>
        </DialogActions>
      </Dialog>

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