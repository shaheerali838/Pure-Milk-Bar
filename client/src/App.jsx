import React from "react";
import { AppProviders } from "./context/AppProviders";
import { AppRouter } from "./routes";

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
