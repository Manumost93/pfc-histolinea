import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TimelineIcon from "@mui/icons-material/Timeline";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import GitHubIcon from "@mui/icons-material/GitHub";

import EventsPage from "./pages/EventsPage";
import TimelinePage from "./pages/TimelinePage";
import { createAppTheme } from "./theme";

export default function App() {
  const [tab, setTab] = useState<"events" | "timeline">("events");
  const [mode, setMode] = useState<PaletteMode>("light");
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const page = useMemo(
    () => (tab === "events" ? <EventsPage /> : <TimelinePage />),
    [tab]
  );

  const bgStyle = {
    backgroundImage:
      mode === "dark"
        ? "radial-gradient(rgba(122,79,42,0.20) 1px, transparent 1px), linear-gradient(180deg, rgba(0,0,0,0.30), transparent 40%)"
        : "radial-gradient(rgba(122,79,42,0.10) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.35), transparent 40%)",
    backgroundSize: "18px 18px, auto",
    backgroundColor: mode === "dark" ? "#1a1410" : "#FBF7F1",
    transition: "background-color 0.25s ease",
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", ...bgStyle }}>

        {/* AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            borderBottom: "1px solid rgba(122,79,42,0.15)",
            backdropFilter: "blur(14px)",
            backgroundColor:
              mode === "dark"
                ? "rgba(26,20,16,0.88)"
                : "rgba(251,247,241,0.88)",
            transition: "background-color 0.25s ease",
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ px: { xs: 0, sm: 0 }, gap: 2, minHeight: 60 }}>

              {/* Logo */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #7A4F2A 0%, #a0652a 100%)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(122,79,42,0.35)",
                  }}
                >
                  <HistoryEduIcon sx={{ color: "#fff", fontSize: 22 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    fontWeight={900}
                    sx={{ lineHeight: 1.1, letterSpacing: -0.5 }}
                  >
                    HistoLinea
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Gestor de eventos históricos
                  </Typography>
                </Box>
              </Box>

              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="primary"
                sx={{ "& .MuiTabs-indicator": { height: 3, borderRadius: 999 } }}
              >
                <Tab
                  value="events"
                  icon={<EventNoteIcon fontSize="small" />}
                  iconPosition="start"
                  label="Eventos"
                />
                <Tab
                  value="timeline"
                  icon={<TimelineIcon fontSize="small" />}
                  iconPosition="start"
                  label="Timeline"
                />
              </Tabs>

              {/* Dark mode toggle */}
              <Tooltip title={mode === "dark" ? "Modo claro" : "Modo oscuro"}>
                <IconButton
                  onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                  color="inherit"
                  size="small"
                  sx={{ ml: 0.5 }}
                >
                  {mode === "dark" ? (
                    <Brightness7Icon fontSize="small" />
                  ) : (
                    <Brightness4Icon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

            </Toolbar>
          </Container>
          <Divider />
        </AppBar>

        {/* Page content */}
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 3, sm: 4 }, display: "flex", justifyContent: "center" }}
        >
          <Box sx={{ width: "100%", maxWidth: 1100 }}>{page}</Box>
        </Container>

        {/* Footer */}
        <Box sx={{ py: 3 }}>
          <Container maxWidth="lg">
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} HistoLinea · PFC DAM · Manuel Honrado Vega · UAX
                &nbsp;·&nbsp; React 19 + .NET 8
              </Typography>
              <Tooltip title="Ver código en GitHub">
                <IconButton
                  size="small"
                  color="inherit"
                  component="a"
                  href="https://github.com/Manumost93/pfc-histolinea"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Container>
        </Box>

      </Box>
    </ThemeProvider>
  );
}
