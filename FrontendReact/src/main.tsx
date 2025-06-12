// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";          // ← on importe App (pas ChatInterface)
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />                       // ← on affiche App
  </React.StrictMode>
);
