import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X } from "lucide-react";
import "./ReviewForm.css"; // Reusamos estilos

const GoogleLocationSearch = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);
  const placesLibrary = useMapsLibrary("places");
  const autocompleteRef = useRef(null);

  // Guardamos onChange en un ref para poder llamarlo dentro del listener
  // sin tener que meterlo en las dependencias del useEffect (esto evita el bug de reinicio)
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // Si la librería no cargó o no hay input, no hacemos nada
    if (!placesLibrary || !inputRef.current) return;

    // --- CONFIGURACIÓN INTELIGENTE (CABA/GBA) ---
    const center = { lat: -34.6037, lng: -58.3816 }; // Coordenadas del Obelisco

    // Definimos un radio de preferencia (aprox 50km a la redonda para cubrir AMBA)
    const defaultBounds = {
      north: center.lat + 0.5,
      south: center.lat - 0.5,
      east: center.lng + 0.5,
      west: center.lng - 0.5,
    };

    const opts = {
      fields: ["geometry", "name", "formatted_address", "url"],
      types: ["establishment", "geocode"],
      // 1. FILTRO DE PAÍS: Solo Argentina (Adiós Andorra)
      componentRestrictions: { country: "ar" },
      // 2. BIAS GEOGRÁFICO: Prioridad a Buenos Aires
      locationBias: defaultBounds,
    };

    // Crear la instancia SOLO UNA VEZ
    const auto = new placesLibrary.Autocomplete(inputRef.current, opts);
    autocompleteRef.current = auto;

    // Listener
    const listener = auto.addListener("place_changed", () => {
      const place = auto.getPlace();

      if (!place.name) return;

      // Limpieza de nombre
      let cleanAddress = place.name;
      if (place.formatted_address) {
        const addressParts = place.formatted_address.split(",");
        if (addressParts.length > 1) {
          cleanAddress = `${place.name}, ${addressParts[1].trim()}`;
        }
      }

      setInputValue(cleanAddress);
      // Usamos el ref para llamar a la función más reciente sin romper el hook
      if (onChangeRef.current) {
        onChangeRef.current(cleanAddress);
      }
    });

    // Cleanup
    return () => {
      if (window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(listener);
      }
    };
    // ¡OJO AQUÍ! Quitamos 'onChange' de las dependencias.
    // Ahora solo se reinicia si cambia la librería (que no pasa nunca).
  }, [placesLibrary]);

  // Sincronizar si el valor viene de fuera (ej: limpiar form)
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  return (
    <div className="input-wrapper">
      <MapPin className="input-icon" size={20} strokeWidth={3} />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        // Actualizamos el estado local mientras escribes para que React no se pelee con Google
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="Busca en Google Maps..."
        className="modern-input"
        // Importante: Desactivar autocompletado del navegador para que no tape al de Google
        autoComplete="off"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setInputValue("");
            onChange("");
            // Foco de vuelta al input tras limpiar
            if (inputRef.current) inputRef.current.focus();
          }}
          style={{
            position: "absolute",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default GoogleLocationSearch;
