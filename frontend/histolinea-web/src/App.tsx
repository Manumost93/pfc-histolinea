import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Container,
  Divider,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TimelineIcon from "@mui/icons-material/Timeline";

import EventsPage from "./pages/EventsPage";
import TimelinePage from "./pages/TimelinePage";

export default function App() {
  const [tab, setTab] = useState<"events" | "timeline">("events");

  const page = useMemo(() => {
    return tab === "events" ? <EventsPage /> : <TimelinePage />;
  }, [tab]);

  return (
    <Box className="histolinea-bg" sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: "1px solid rgba(122,79,42,0.15)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 0 }, gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <HistoryEduIcon />
              <Box>
                <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.1 }}>
                  HistoLinea
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Eventos históricos · Lista + Timeline
                </Typography>
              </Box>
            </Box>

            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                "& .MuiTabs-indicator": { height: 3, borderRadius: 999 },
              }}
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
          </Toolbar>
        </Container>
        <Divider />
      </AppBar>

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

      <Box sx={{ py: 3 }}>
        <Container maxWidth="lg">
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} HistoLinea · PFC DAM · React + .NET 8
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}