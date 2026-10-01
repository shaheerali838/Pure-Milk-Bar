import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";

// Disable mouse scroll altering number inputs globally across the application
document.addEventListener(
  "wheel",
  () => {
    if (
      document.activeElement &&
      document.activeElement instanceof HTMLInputElement &&
      document.activeElement.type === "number"
    ) {
      document.activeElement.blur();
    }
  },
  { passive: true }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
