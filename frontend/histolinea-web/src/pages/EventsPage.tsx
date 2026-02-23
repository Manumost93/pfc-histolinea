import { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<HistoricalEvent | null>(null);

  const [viewDialog, setViewDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string | null;
    title: string;
  }>({
    open: false,
    id: null,
    title: "",
  });

  async function load() {
    setLoading(true);
    try {
      const res = await http.get<HistoricalEvent[]>("/api/Events");
      setRows(res.data);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error cargando eventos",
      });
      setRows([]);
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
    setViewDialog(true);
  }

  function openDeleteDialog(event: HistoricalEvent) {
    setDeleteDialog({
      open: true,
      id: event.id,
      title: event.title,
    });
  }

  async function confirmDelete() {
    if (!deleteDialog.id) return;

    try {
      await http.delete(`/api/Events/${deleteDialog.id}`);
      await load();

      setSnackbar({
        open: true,
        severity: "success",
        message: "Evento eliminado correctamente",
      });
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error eliminando evento",
      });
    } finally {
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  }

  async function submit(payload: any) {
    try {
      if (dialogMode === "create") {
        await http.post("/api/Events", payload);
      } else {
        await http.put(`/api/Events/${selected?.id}`, payload);
      }

      await load();

      setSnackbar({
        open: true,
        severity: "success",
        message:
          dialogMode === "create"
            ? "Evento creado correctamente"
            : "Evento actualizado correctamente",
      });
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Error guardando evento",
      });
    }
  }

  const columns: GridColDef<HistoricalEvent>[] = [
    { field: "title", headerName: "Título", flex: 1, minWidth: 220 },
    { field: "startDate", headerName: "Inicio", width: 140 },
    { field: "endDate", headerName: "Fin", width: 140 },
    {
      field: "actions",
      headerName: "Acciones",
      width: 170,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton size="small" onClick={() => openView(params.row)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openEdit(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => openDeleteDialog(params.row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 1000, mx: "auto" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventIcon color="primary" />
            <Typography variant="h4" fontWeight={600}>
              Eventos históricos
            </Typography>
          </Stack>

          <Button variant="contained" size="large" onClick={openCreate}>
            Crear evento
          </Button>
        </Stack>

        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 2,
            p: 2,
          }}
        >
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
              "& .MuiDataGrid-columnHeaders": { fontWeight: 600 },
            }}
          />

          {!loading && rows.length === 0 && (
            <Stack alignItems="center" py={5} spacing={1}>
              <EventIcon sx={{ fontSize: 40, opacity: 0.4 }} />
              <Typography color="text.secondary">
                No hay eventos todavía
              </Typography>
            </Stack>
          )}
        </Box>

        <EventDialog
          open={dialogOpen}
          mode={dialogMode}
          initial={selected}
          onClose={() => setDialogOpen(false)}
          onSubmit={submit}
        />

        {/* VIEW DIALOG */}
        <Dialog open={viewDialog} onClose={() => setViewDialog(false)}>
          <DialogTitle>{selected?.title}</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              {selected?.description || "Sin descripción"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inicio: {selected?.startDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fin: {selected?.endDate || "-"}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* DELETE DIALOG */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
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
    </Box>
  );
}