import React from "react";
import { AppProviders } from "./context/AppProviders";
import { AppRouter } from "./routes";

/**
 * Root Application Component
 * Initializes context providers and application routing.
 */
export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
