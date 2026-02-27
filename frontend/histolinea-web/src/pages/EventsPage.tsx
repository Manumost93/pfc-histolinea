import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { http } from "../api/http";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import EventDialog from "../components/EventDialog";
import { ERA_OPTIONS, overlapsRange, getEraByStartDate } from "../utils/era";
import type { EraKey } from "../utils/era";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1 }}>
        <SearchIcon fontSize="small" />
        <GridToolbarQuickFilter />
      </Stack>
    </GridToolbarContainer>
  );
}

function minMaxDates(rows: HistoricalEvent[]) {
  if (rows.length === 0) return { min: null as string | null, max: null as string | null };
  const starts = rows.map((r) => r.startDate).sort();
  const ends = rows.map((r) => r.endDate ?? r.startDate).sort();
  return { min: starts[0], max: ends[ends.length - 1] };
}

export default function EventsPage() {
  const [rows, setRows] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [era, setEra] = useState<"all" | EraKey>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<HistoricalEvent | null>(null);

  // View dialog
  const [viewOpen, setViewOpen] = useState(false);

  // Delete confirm
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    title: string;
  }>({ open: false, id: null, title: "" });

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await http.get<HistoricalEvent[]>("/api/Events");
      setRows(res.data);
    } catch (err) {
      console.error(err);
      setRows([]);
      setSnackbar({ open: true, severity: "error", message: "Error cargando eventos" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const f = from.trim() || undefined;
    const t = to.trim() || undefined;

    return rows.filter((e) => {
      const evEra = getEraByStartDate(e.startDate).key;
      if (era !== "all" && evEra !== era) return false;

      if (!overlapsRange({ startDate: e.startDate, endDate: e.endDate, from: f, to: t })) return false;

      return true;
    });
  }, [rows, era, from, to]);

  const stats = useMemo(() => {
    const { min, max } = minMaxDates(filteredRows);
    return {
      count: filteredRows.length,
      range: min && max ? `${min} → ${max}` : "—",
    };
  }, [filteredRows]);

  function resetFilters() {
    setEra("all");
    setFrom("");
    setTo("");
  }

  function openCreate() {
    setDialogMode("create");
    setSelected(null);
    setDialogOpen(true);
  }

  function openEdit(row: HistoricalEvent) {
    setDialogMode("edit");
    setSelected(row);
    setDialogOpen(true);
  }

  function openView(row: HistoricalEvent) {
    setSelected(row);
    setViewOpen(true);
  }

  function openDelete(row: HistoricalEvent) {
    setDeleteDialog({ open: true, id: row.id, title: row.title });
  }

  async function confirmDelete() {
    if (!deleteDialog.id) return;

    try {
      await http.delete(`/api/Events/${deleteDialog.id}`);
      await load();
      setSnackbar({ open: true, severity: "success", message: "Evento eliminado" });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error eliminando evento" });
    } finally {
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  }

  async function submit(payload: {
    title: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    imageUrl: string | null;
    sourceUrl: string | null;
  }) {
    try {
      if (dialogMode === "create") {
        await http.post("/api/Events", payload);
      } else {
        if (!selected) throw new Error("No hay evento seleccionado");
        await http.put(`/api/Events/${selected.id}`, payload);
      }

      await load();
      setSnackbar({
        open: true,
        severity: "success",
        message: dialogMode === "create" ? "Evento creado" : "Evento actualizado",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, severity: "error", message: "Error guardando evento" });
      throw err;
    }
  }

  const columns: GridColDef<HistoricalEvent>[] = [
    { field: "title", headerName: "Título", flex: 1, minWidth: 280 },
    { field: "startDate", headerName: "Inicio", width: 140 },
    { field: "endDate", headerName: "Fin", width: 140 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Ver">
            <IconButton size="small" onClick={() => openView(params.row)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => openEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Borrar">
            <IconButton size="small" onClick={() => openDelete(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const hasActiveFilters = era !== "all" || !!from.trim() || !!to.trim();

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
          <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(122,79,42,0.10)",
                border: "1px solid rgba(122,79,42,0.18)",
              }}
            >
              <EventIcon />
            </Box>
            <Box>
              <Typography variant="h4">Eventos</Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona tu colección y explórala en timeline.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={`${stats.count} eventos`} />
            <Chip variant="outlined" label={`Rango: ${stats.range}`} />
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

        {hasActiveFilters && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Mostrando {filteredRows.length} de {rows.length} eventos.
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          slots={{ toolbar: CustomToolbar }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { fontWeight: 900 },
            "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(122,79,42,0.05)" },
          }}
        />

        {!loading && filteredRows.length === 0 && (
          <Stack alignItems="center" py={5} spacing={1}>
            <EventIcon sx={{ fontSize: 44, opacity: 0.35 }} />
            <Typography color="text.secondary">
              No hay eventos para estos filtros
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={resetFilters} disabled={!hasActiveFilters}>
                Reset filtros
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                Crear evento
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>

      {/* CREATE / EDIT */}
      <EventDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        onClose={() => setDialogOpen(false)}
        onSubmit={submit}
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
                mb: 2,
                overflow: "hidden",
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
        </DialogActions>
      </Dialog>

      {/* DELETE confirm */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>Confirmar eliminación</DialogTitle>
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

      {/* Snackbar */}
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