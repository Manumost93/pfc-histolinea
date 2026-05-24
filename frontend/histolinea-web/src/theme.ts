import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  return createTheme({
    typography: {
      fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
      h4: { fontWeight: 900, letterSpacing: -0.6 },
      h5: { fontWeight: 900, letterSpacing: -0.4 },
      h6: { fontWeight: 900 },
      button: { fontWeight: 800, textTransform: "none" },
    },
    shape: { borderRadius: 14 },
    palette: {
      mode,
      primary: { main: "#7A4F2A" },
      secondary: { main: "#1F6FEB" },
      background: {
        default: isDark ? "#1a1410" : "#FBF7F1",
        paper: isDark ? "rgba(38,26,16,0.92)" : "rgba(255,255,255,0.82)",
      },
      text: {
        primary: isDark ? "rgba(240,228,210,0.95)" : "rgba(20,20,20,0.92)",
        secondary: isDark ? "rgba(240,228,210,0.65)" : "rgba(20,20,20,0.66)",
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            border: isDark
              ? "1px solid rgba(122,79,42,0.28)"
              : "1px solid rgba(122,79,42,0.14)",
            boxShadow: isDark
              ? "0 16px 36px rgba(0,0,0,0.45)"
              : "0 16px 36px rgba(0,0,0,0.10)",
            backdropFilter: "blur(10px)",
            transition: "background-color 0.25s ease, border-color 0.25s ease",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            paddingLeft: 14,
            paddingRight: 14,
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
            "&:active": { transform: "scale(0.97)" },
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
        defaultProps: { size: "small" },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 700 },
        },
      },
    },
  });
}

export default createAppTheme("light");
