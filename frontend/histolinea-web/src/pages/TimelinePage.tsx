import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TodayIcon from "@mui/icons-material/Today";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { DataSet } from "vis-data";
import { Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";

import { http } from "../api/http";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import EventDialog from "../components/EventDialog";
import { ERA_OPTIONS, overlapsRange, getEraByStartDate } from "../utils/era";
import type { EraKey } from "../utils/era";

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
function escapeAttr(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function minMaxDates(rows: HistoricalEvent[]) {
  if (rows.length === 0) return { min: null as string | null, max: null as string | null };
  const starts = rows.map((r) => r.startDate).sort();
  const ends = rows.map((r) => r.endDate ?? r.startDate).sort();
  return { min: starts[0], max: ends[ends.length - 1] };
}

export default function TimelinePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);

  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const eventsRef = useRef<HistoricalEvent[]>([]);

  // Filters
  const [era, setEra] = useState<"all" | EraKey>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

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

  // 🔑 Para que el "select" siempre busque en lo que se ve (filtrado)
  const filteredEvents = useMemo(() => {
    const f = from.trim() || undefined;
    const t = to.trim() || undefined;

    return events.filter((e) => {
      const evEra = getEraByStartDate(e.startDate).key;
      if (era !== "all" && evEra !== era) return false;

      if (!overlapsRange({ startDate: e.startDate, endDate: e.endDate, from: f, to: t })) return false;

      return true;
    });
  }, [events, era, from, to]);

  useEffect(() => {
    eventsRef.current = filteredEvents;
  }, [filteredEvents]);

  // Crear timeline una sola vez
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const timeline = new Timeline(container, new DataSet([]), {
      stack: true,
      horizontalScroll: true,
      zoomKey: "ctrlKey",
      maxHeight: 560,
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

  const groups = useMemo(() => {
    return new DataSet([
      { id: "ancient", content: "Antigua", className: "era-ancient" },
      { id: "medieval", content: "Medieval", className: "era-medieval" },
      { id: "modern", content: "Moderna", className: "era-modern" },
      { id: "contemporary", content: "Contemporánea", className: "era-contemporary" },
    ]);
  }, []);

  const items = useMemo(() => {
    return new DataSet(
      filteredEvents.map((e) => {
        const eraInfo = getEraByStartDate(e.startDate);

        const title = escapeHtml(e.title);
        const safeUrl = e.imageUrl ? escapeAttr(e.imageUrl) : null;

        const thumb = safeUrl
          ? `
            <span style="width:36px;height:36px;display:inline-block;flex:0 0 36px;border-radius:10px;overflow:hidden;border:1px solid rgba(122,79,42,0.25);background:rgba(122,79,42,0.08)">
              <img src="${safeUrl}" style="width:100%;height:100%;display:block;object-fit:cover;" />
            </span>
          `
          : `
            <span style="width:36px;height:36px;border-radius:10px;display:inline-block;flex:0 0 36px;background:rgba(122,79,42,0.18);border:1px solid rgba(122,79,42,0.25)"></span>
          `;

        const dot = `
          <span style="width:11px;height:11px;border-radius:999px;display:inline-block;background:${eraInfo.dot};box-shadow:0 0 0 3px rgba(255,255,255,0.95);border:1px solid rgba(0,0,0,0.08)"></span>
        `;

        const content = `
          <div style="display:flex;align-items:center;gap:10px;">
            ${dot}
            ${thumb}
            <span style="font-weight:900;line-height:1.15;">${title}</span>
          </div>
        `;

        const tooltip = `
          <div style="max-width:380px;">
            ${
              safeUrl
                ? `<img src="${safeUrl}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;display:block;margin-bottom:10px;" />`
                : ""
            }
            <div style="font-weight:950;margin-bottom:6px;">${title}</div>
            <div style="opacity:.85;">${escapeHtml(e.description || "Sin descripción")}</div>
            <div style="margin-top:10px;opacity:.75;font-size:12px;">
              <b>${escapeHtml(e.startDate)}</b>${e.endDate ? " → <b>" + escapeHtml(e.endDate) + "</b>" : ""}
              · Época: <b>${escapeHtml(eraInfo.label)}</b>
            </div>
          </div>
        `;

        return {
          id: e.id,
          group: eraInfo.key,
          className: eraInfo.className,
          content,
          start: e.startDate,
          end: e.endDate || undefined,
          title: tooltip,
        };
      })
    );
  }, [filteredEvents]);

  useEffect(() => {
    if (!timelineRef.current) return;
    timelineRef.current.setGroups(groups);
    timelineRef.current.setItems(items);
    if (filteredEvents.length > 0) timelineRef.current.fit({ animation: { duration: 250 } });
  }, [groups, items, filteredEvents.length]);

  const stats = useMemo(() => {
    const { min, max } = minMaxDates(filteredEvents);
    return {
      count: filteredEvents.length,
      range: min && max ? `${min} → ${max}` : "—",
    };
  }, [filteredEvents]);

  function fitAll() {
    timelineRef.current?.fit({ animation: { duration: 250 } });
  }

  function goToday() {
    const t = timelineRef.current;
    if (!t) return;
    t.moveTo(new Date(), { animation: { duration: 250 } });
  }

  function resetFilters() {
    setEra("all");
    setFrom("");
    setTo("");
  }

  const hasActiveFilters = era !== "all" || !!from.trim() || !!to.trim();

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
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">Timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              Ctrl + rueda = zoom · Hover para preview · Click para detalles
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={`${stats.count} eventos`} />
            <Chip variant="outlined" label={`Rango: ${stats.range}`} />
            <Button variant="outlined" startIcon={<ZoomOutMapIcon />} onClick={fitAll}>
              Fit
            </Button>
            <Button variant="outlined" startIcon={<TodayIcon />} onClick={goToday}>
              Hoy
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Crear
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Época</InputLabel>
            <Select value={era} label="Época" onChange={(e) => setEra(e.target.value as any)}>
              {ERA_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Desde"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", sm: 190 } }}
          />

          <TextField
            label="Hasta"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: { xs: "100%", sm: 190 } }}
          />

          <Box sx={{ flex: 1 }} />

          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={resetFilters}
            disabled={!hasActiveFilters}
          >
            Reset
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
          <Chip size="small" label="Antigua" className="era-ancient" />
          <Chip size="small" label="Medieval" className="era-medieval" />
          <Chip size="small" label="Moderna" className="era-modern" />
          <Chip size="small" label="Contemporánea" className="era-contemporary" />
          {hasActiveFilters && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, alignSelf: "center" }}>
              Mostrando {filteredEvents.length} de {events.length} eventos.
            </Typography>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 1 }}>
        <Box
          ref={containerRef}
          sx={{
            height: 560,
            overflow: "hidden",
            borderRadius: 3,
          }}
        />
      </Paper>

      {/* VIEW */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 950 }}>{selected?.title}</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 950 }}>Confirmar eliminación</DialogTitle>
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