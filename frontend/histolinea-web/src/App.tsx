import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

import { theme } from "./theme";
import EventsPage from "./pages/EventsPage";
import TimelinePage from "./pages/TimelinePage";

export default function App() {
  const [view, setView] = useState<"list" | "timeline">("list");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,250,240,0.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(122,79,42,0.18)",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <HistoryEduIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            HistoLinea
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="list" label="Eventos" />
            <Tab value="timeline" label="Timeline" />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {view === "list" && <EventsPage key="list" />}
        {view === "timeline" && <TimelinePage key="timeline" />}
      </Container>
    </ThemeProvider>
  );
}