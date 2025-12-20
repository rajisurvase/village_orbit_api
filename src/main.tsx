import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Register push notification service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/push-sw.js")
    .then((registration) => {
      console.log("[Push SW] Service worker registered:", registration.scope);
    })
    .catch((error) => {
      console.error("[Push SW] Service worker registration failed:", error);
    });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
