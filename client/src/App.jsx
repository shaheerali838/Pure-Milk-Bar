import React from "react";
import { AppProviders } from "./context/AppProviders";
import { AppRouter } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </AppProviders>
  );
}
