import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

import { http } from "../api/http";
import type { HistoricalEvent } from "../types/HistoricalEvent";
import EventDialog from "../components/EventDialog";

export default function EventsPage() {
  const [rows, setRows] = useState<HistoricalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<HistoricalEvent | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await http.get<HistoricalEvent[]>("/api/Events");
      setRows(res.data);
    } catch (err) {
      console.error("Error cargando eventos:", err);
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

  function closeDialog() {
    setDialogOpen(false);
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
        if (!selected) throw new Error("No hay evento seleccionado para editar");
        await http.put(`/api/Events/${selected.id}`, payload);
      }
      await load();
    } catch (err) {
      console.error("Error guardando evento:", err);
      alert("No se pudo guardar. Mira la consola (F12).");
      throw err;
    }
  }

  async function removeEvent(id: string) {
    const ok = window.confirm("¿Seguro que quieres borrar este evento?");
    if (!ok) return;

    try {
      await http.delete(`/api/Events/${id}`);
      await load();
    } catch (err) {
      console.error("Error borrando evento:", err);
      alert("No se pudo borrar el evento. Mira la consola (F12).");
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
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            title="Ver"
            onClick={() =>
              alert(
                `${params.row.title}\n\n${params.row.description ?? "(sin descripción)"}`
              )
            }
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            title="Editar"
            onClick={() => openEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            title="Borrar"
            onClick={() => removeEvent(params.row.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Eventos históricos</Typography>
        <Button variant="contained" onClick={openCreate}>
          Crear evento
        </Button>
      </Stack>

      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
        />
      </Box>

      <EventDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        onClose={closeDialog}
        onSubmit={submit}
      />
    </Box>
  );
}