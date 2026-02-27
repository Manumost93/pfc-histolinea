import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

import EventsPage from "./pages/EventsPage";
import TimelinePage from "./pages/TimelinePage";

export default function App() {
  const [tab, setTab] = useState<"events" | "timeline">("events");

  const page = useMemo(() => {
    return tab === "events" ? <EventsPage /> : <TimelinePage />;
  }, [tab]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        // Fondo "papel" con puntos
        backgroundImage:
          "radial-gradient(rgba(122,79,42,0.10) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: "1px solid rgba(122,79,42,0.15)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 0 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <HistoryEduIcon />
              <Typography variant="h6" fontWeight={900}>
                HistoLinea
              </Typography>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="inherit"
              indicatorColor="primary"
            >
              <Tab value="events" label="EVENTOS" />
              <Tab value="timeline" label="TIMELINE" />
            </Tabs>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ✅ Contenedor global centrado para TODAS las páginas */}
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 3, sm: 4 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1100 }}>{page}</Box>
      </Container>
    </Box>
  );
}