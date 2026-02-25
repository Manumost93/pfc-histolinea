import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f6f0e3",
      paper: "#fffaf0",
    },
    primary: {
      main: "#7a4f2a",
    },
    secondary: {
      main: "#2f4f4f",
    },
  },
  typography: {
    fontFamily: [
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { letterSpacing: 0.2 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f6f0e3",
          backgroundImage:
            "radial-gradient(rgba(122,79,42,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,79,42,0.06), transparent 240px)",
          backgroundSize: "18px 18px, 100% 100%",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(122,79,42,0.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});