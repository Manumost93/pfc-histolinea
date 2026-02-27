import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { http } from "../api/http";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import EventDialog from "../components/EventDialog";

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

export default function EventsPage() {
  const [rows, setRows] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

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
    { field: "title", headerName: "Título", flex: 1, minWidth: 260 },
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
          <IconButton size="small" title="Ver" onClick={() => openView(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" title="Editar" onClick={() => openEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" title="Borrar" onClick={() => openDelete(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        sx={{ px: 1 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventIcon color="primary" />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Eventos históricos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tu colección y visualízala en la timeline.
            </Typography>
          </Box>
        </Stack>

        <Button variant="contained" size="large" onClick={openCreate}>
          Crear evento
        </Button>
      </Stack>

      <Box sx={{ bgcolor: "background.paper", borderRadius: 2, boxShadow: 2, p: 2 }}>
        <DataGrid
          rows={rows}
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
            "& .MuiDataGrid-columnHeaders": { fontWeight: 700 },
            "& .MuiDataGrid-row:hover": { backgroundColor: "rgba(122,79,42,0.05)" },
          }}
        />

        {!loading && rows.length === 0 && (
          <Stack alignItems="center" py={5} spacing={1}>
            <EventIcon sx={{ fontSize: 40, opacity: 0.35 }} />
            <Typography color="text.secondary">No hay eventos todavía</Typography>
          </Stack>
        )}
      </Box>

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
        <DialogTitle sx={{ fontWeight: 800 }}>{selected?.title}</DialogTitle>
        <DialogContent dividers>
          {selected?.imageUrl ? (
            <Box
              sx={{
                width: "100%",
                height: 260,
                borderRadius: 2,
                mb: 2,
                overflow: "hidden",
                boxShadow: 1,
                bgcolor: "rgba(122,79,42,0.06)",
                border: "1px solid rgba(122,79,42,0.15)",
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
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
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