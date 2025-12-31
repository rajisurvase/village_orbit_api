import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Announcement } from "./components/Announcement.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Announcement />
  </StrictMode>
);
