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
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TodayIcon from "@mui/icons-material/Today";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
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

type TimelineSelectProps = {
  items?: string[];
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

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  return `${day}/${m}/${y}`;
}

function minMaxDates(rows: HistoricalEvent[]) {
  if (rows.length === 0) return { min: null as string | null, max: null as string | null };
  const starts = rows.map((r) => r.startDate).sort();
  const ends = rows.map((r) => r.endDate ?? r.startDate).sort();
  return { min: starts[0], max: ends[ends.length - 1] };
}

const ERA_COLORS: Record<EraKey, string> = {
  ancient: "#2e7d32",
  medieval: "#6d4c41",
  modern: "#1565c0",
  contemporary: "#6a1b9a",
};

export default function TimelinePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);

  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const eventsRef = useRef<HistoricalEvent[]>([]);

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

  useEffect(() => { load(); }, []);

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

  useEffect(() => { eventsRef.current = filteredEvents; }, [filteredEvents]);

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

    timeline.on("select", (props: TimelineSelectProps) => {
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
          ? `<div class="timeline-thumb"><img src="${safeUrl}" alt="miniatura" /></div>`
          : `<div class="timeline-thumb"></div>`;

        const content = `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 10px 6px 6px;border-radius:12px;min-width:180px;max-width:260px;">
            ${thumb}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:900;font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
              <div style="font-size:11px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${escapeHtml(e.description || "Sin descripción")}</div>
            </div>
          </div>
        `;

        const tooltip = `
          <div style="max-width:320px;font-family:Inter,system-ui,sans-serif;">
            ${safeUrl
              ? `<div style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:10px 10px 0 0;background:#f8f5f2;"><img src="${safeUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`
              : ""}
            <div style="padding:12px 14px 10px 14px;">
              <div style="font-weight:900;margin-bottom:5px;font-size:15px;line-height:1.25;">${title}</div>
              <div style="opacity:.80;font-size:12.5px;line-height:1.5;">${escapeHtml(e.description || "Sin descripción")}</div>
              <div style="margin-top:10px;opacity:.65;font-size:11px;display:flex;gap:6px;flex-wrap:wrap;">
                <span>📅 <b>${escapeHtml(e.startDate)}</b>${e.endDate ? " → <b>" + escapeHtml(e.endDate) + "</b>" : ""}</span>
                <span>·</span>
                <span>${escapeHtml(eraInfo.label)}</span>
              </div>
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
    if (filteredEvents.length > 0) timelineRef.current.fit({ animation: { duration: 300 } });
  }, [groups, items, filteredEvents.length]);

  const stats = useMemo(() => {
    const { min, max } = minMaxDates(filteredEvents);
    return {
      count: filteredEvents.length,
      range: min && max ? `${min} → ${max}` : "—",
    };
  }, [filteredEvents]);

  function fitAll() { timelineRef.current?.fit({ animation: { duration: 300 } }); }
  function goToday() {
    timelineRef.current?.moveTo(new Date(), { animation: { duration: 300 } });
  }
  function resetFilters() {
    setEra("all");
    setFrom("");
    setTo("");
  }

  const hasActiveFilters = era !== "all" || !!from.trim() || !!to.trim();

  function openCreate() { setSelected(null); setCreateOpen(true); }
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

  const selectedEra = selected ? getEraByStartDate(selected.startDate) : null;

  return (
    <Box sx={{ width: "100%" }}>

      {/* Cabecera */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4">Timeline</Typography>
            <Typography variant="body2" color="text.secondary">
              Ctrl + rueda = zoom &nbsp;·&nbsp; Hover para preview &nbsp;·&nbsp; Click para detalles
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={`${stats.count} evento${stats.count !== 1 ? "s" : ""}`} />
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

        {/* Filtros */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Época</InputLabel>
            <Select
              value={era}
              label="Época"
              onChange={(e: SelectChangeEvent<"all" | EraKey>) =>
                setEra(e.target.value as "all" | EraKey)
              }
            >
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

        {/* Leyenda de épocas */}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" alignItems="center">
          {(Object.entries(ERA_COLORS) as [EraKey, string][]).map(([key, color]) => {
            const label = ERA_OPTIONS.find((o) => o.value === key)?.label ?? key;
            return (
              <Chip
                key={key}
                size="small"
                label={label}
                sx={{ bgcolor: color, color: "#fff", fontWeight: 700, fontSize: 11 }}
              />
            );
          })}
          {hasActiveFilters && (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", ml: 0.5 }}>
              Mostrando {filteredEvents.length} de {events.length}
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Timeline */}
      <Paper sx={{ p: 1.5 }}>
        <Box
          ref={containerRef}
          sx={{ height: 560, overflow: "hidden", borderRadius: 2.5 }}
        />
      </Paper>

      {filteredEvents.length === 0 && (
        <Paper sx={{ mt: 2.5, p: 5, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1, opacity: 0.7 }}>
            No hay eventos para mostrar
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2.5 }}>
            Crea nuevos eventos o ajusta los filtros activos.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            {hasActiveFilters && (
              <Button variant="outlined" onClick={resetFilters} startIcon={<RestartAltIcon />}>
                Limpiar filtros
              </Button>
            )}
            <Button variant="contained" onClick={openCreate} startIcon={<AddIcon />}>
              Crear evento
            </Button>
          </Stack>
        </Paper>
      )}

      {/* VIEW */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ fontWeight: 950, display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}
        >
          {selected?.title}
          {selectedEra && (
            <Chip
              size="small"
              label={selectedEra.label}
              sx={{
                bgcolor: ERA_COLORS[selectedEra.key],
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                ml: "auto",
                flexShrink: 0,
              }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {selected?.imageUrl ? (
            <Box
              sx={{
                width: "100%",
                height: 260,
                borderRadius: 2,
                overflow: "hidden",
                mb: 2.5,
                border: "1px solid rgba(122,79,42,0.15)",
                bgcolor: "rgba(122,79,42,0.06)",
              }}
            >
              <Box
                component="img"
                src={selected.imageUrl}
                alt={selected.title}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>
          ) : null}

          <Typography sx={{ mb: 2.5, lineHeight: 1.7 }}>
            {selected?.description || "Sin descripción."}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                INICIO
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {formatDate(selected?.startDate)}
              </Typography>
            </Box>
            {selected?.endDate && (
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  FIN
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatDate(selected.endDate)}
                </Typography>
              </Box>
            )}
          </Stack>

          {selected?.sourceUrl && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                FUENTE
              </Typography>
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon fontSize="small" />}
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  component="a"
                  sx={{ mt: 0.5 }}
                >
                  Ver fuente
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={openDeleteFromView}>
            Eliminar
          </Button>
          <Button onClick={() => setViewOpen(false)}>Cerrar</Button>
          <Button variant="contained" startIcon={<EditIcon />} onClick={openEditFromView}>
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
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}
      >
        <DialogTitle sx={{ fontWeight: 950 }}>Confirmar eliminación</DialogTitle>
        <DialogContent dividers>
          ¿Seguro que quieres eliminar <b>{deleteDialog.title}</b>? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, title: "" })}>
            Cancelar
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Eliminar
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
