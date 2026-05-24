import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
    h4: { fontWeight: 900, letterSpacing: -0.6 },
    h5: { fontWeight: 900, letterSpacing: -0.4 },
    h6: { fontWeight: 900 },
    button: { fontWeight: 800, textTransform: "none" },
  },
  shape: { borderRadius: 14 },
  palette: {
    mode: "light",
    primary: { main: "#7A4F2A" }, // cuero
    secondary: { main: "#1F6FEB" }, // azul discreto
    background: {
      default: "#FBF7F1", // parchment
      paper: "rgba(255,255,255,0.82)",
    },
    text: {
      primary: "rgba(20,20,20,0.92)",
      secondary: "rgba(20,20,20,0.66)",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(122,79,42,0.14)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.10)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingLeft: 14,
          paddingRight: 14,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 900,
          letterSpacing: 0.4,
          minHeight: 44,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export default theme;