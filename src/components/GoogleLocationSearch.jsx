/* global google */
import { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X, AlertTriangle } from "lucide-react";
import "./ReviewForm.css";

const GoogleLocationSearch = ({ value, onChange }) => {
  // Empezamos con el valor que nos pasa el padre
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState(false); // Para chequear si la API falla

  const inputRef = useRef(null);
  const placesLibrary = useMapsLibrary("places");
  const autocompleteRef = useRef(null);

  // Ref para manejar onChange sin que se reinicien los efectos
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Solo sincronizamos cuando el padre cambia drásticamente, tipo al limpiar el form
  useEffect(() => {
    if (value === "" && inputValue !== "") {
      setInputValue("");
    }
    // No incluimos 'inputValue' para evitar loops infinitos en mobile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;

    // Config para Argentina, centrado en CABA
    const center = { lat: -34.6037, lng: -58.3816 };
    const defaultBounds = {
      north: center.lat + 0.5,
      south: center.lat - 0.5,
      east: center.lng + 0.5,
      west: center.lng - 0.5,
    };

    const opts = {
      fields: ["name", "formatted_address"], // Pedimos solo lo mínimo para no gastar requests
      types: ["establishment", "geocode"],
      componentRestrictions: { country: "ar" },
      locationBias: defaultBounds,
    };

    let listener = null;
    try {
      const auto = new placesLibrary.Autocomplete(inputRef.current, opts);
      autocompleteRef.current = auto;

      listener = auto.addListener("place_changed", () => {
        const place = auto.getPlace();

        if (!place.name) return;

        let cleanAddress = place.name;
        if (place.formatted_address) {
          const addressParts = place.formatted_address.split(",");
          if (addressParts.length > 1) {
            cleanAddress = `${place.name}, ${addressParts[1].trim()}`;
          }
        }

        setInputValue(cleanAddress);
        if (onChangeRef.current) onChangeRef.current(cleanAddress);
      });

      // Manejo de errores de sesión (opcional, útil para debug)
      // Google no tira eventos de error fáciles, pero si falla la lib lo vemos antes.
    } catch (err) {
      console.error("Error iniciando Autocomplete:", err);
      setError(true);
    }

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [placesLibrary]);

  // Handler manual para cuando el usuario escribe
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    // Avisamos al padre, pero no esperamos que nos devuelva nada
    // Evita lag en Android
    if (onChangeRef.current) onChangeRef.current(val);
  };

  return (
    <div className="input-wrapper" style={{ position: "relative" }}>
      <MapPin className="input-icon" size={20} strokeWidth={3} />

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Busca en Google Maps..."
        className="modern-input"
        autoComplete="off" // Importante: evita que salga el teclado de direcciones en móviles
        inputMode="text" // Para que los móviles sepan qué teclado mostrar
        style={{ fontSize: "16px" }} // Evita zoom en iPhone al escribir
      />

      {/* Botón para limpiar */}
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setInputValue("");
            if (onChangeRef.current) onChangeRef.current("");
            inputRef.current?.focus();
          }}
          style={{
            position: "absolute",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
            padding: "5px", // Área de toque más grande
          }}
        >
          <X size={16} />
        </button>
      )}

      {/* Icono de aviso si algo falla feo */}
      {error && (
        <div style={{ position: "absolute", right: "40px", color: "red" }}>
          <AlertTriangle size={16} />
        </div>
      )}
    </div>
  );
};

export default GoogleLocationSearch;
