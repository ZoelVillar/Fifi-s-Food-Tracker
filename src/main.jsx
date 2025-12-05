import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { APIProvider } from "@vis.gl/react-google-maps"; // <--- Importar
import "./index.css";
import App from "./App.jsx";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // <--- Tu clave nueva

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <APIProvider apiKey={API_KEY} libraries={["places"]}>
      <App />
    </APIProvider>
  </StrictMode>
);
