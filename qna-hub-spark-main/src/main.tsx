// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { registerSW } from "virtual:pwa-register"; // ✅ import PWA helper

// Register the service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Refresh?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline ✅");
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
