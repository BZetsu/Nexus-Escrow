"use client";

import { ThemeProvider, createTheme } from "@mui/material";
import React from "react";

const theme = createTheme({
  typography: {
    fontFamily: "mynamarButton",
    button: {
      textTransform: "none",
    },
  },
  palette: {
    success: {
      main: "#45FF79",
    },
  },
});

export default function MuiTheme({ children }: any) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
