import { useEffect, useState, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X, Loader2 } from "lucide-react";
import "./ReviewForm.css"; // Reutilizamos estilos del form
import "./PopSelect.css"; // Reutilizamos estilos de la lista desplegable

const GoogleLocationSearch = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [options, setOptions] = useState([]); // Lista de predicciones
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const placesLibrary = useMapsLibrary("places");
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const wrapperRef = useRef(null);

  // Inicializar el servicio
  useEffect(() => {
    if (!placesLibrary) return;

    autocompleteService.current = new placesLibrary.AutocompleteService();
    sessionToken.current = new placesLibrary.AutocompleteSessionToken();
  }, [placesLibrary]);

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Si borra todo, limpiamos
    if (!val) {
      setOptions([]);
      setShowOptions(false);
      onChange(""); // Avisamos al padre que se borró
      return;
    }

    setShowOptions(true);
    fetchPredictions(val);
  };

  const fetchPredictions = (val) => {
    if (!autocompleteService.current || !val) return;

    setIsLoading(true);

    const request = {
      input: val,
      sessionToken: sessionToken.current,
      componentRestrictions: { country: "ar" }, // Solo Argentina
      // Bias hacia CABA (Obelisco)
      locationBias: {
        north: -34.5,
        south: -34.7,
        east: -58.3,
        west: -58.5,
      },
    };

    autocompleteService.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setIsLoading(false);
        if (status === "OK" && predictions) {
          setOptions(predictions);
        } else {
          setOptions([]);
        }
      }
    );
  };

  const handleSelectOption = (place) => {
    // El texto principal suele ser el nombre del lugar
    // La descripción completa incluye la dirección
    const fullText = place.description;

    setInputValue(fullText);
    onChange(fullText); // Enviamos al padre
    setShowOptions(false);

    // Generar nuevo token para la siguiente búsqueda (requisito de Google para ahorrar $)
    if (placesLibrary) {
      sessionToken.current = new placesLibrary.AutocompleteSessionToken();
    }
  };

  return (
    <div
      className="location-search-wrapper"
      ref={wrapperRef}
      style={{ position: "relative", width: "100%" }}
    >
      <div className="input-wrapper">
        <MapPin className="input-icon" size={20} strokeWidth={3} />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setShowOptions(true)}
          placeholder="Busca en Google Maps..."
          className="modern-input"
          autoComplete="off"
        />

        {/* Loader o Botón limpiar */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "14px",
            zIndex: 10,
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : inputValue ? (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                onChange("");
                setOptions([]);
                setShowOptions(false);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* LISTA DE RESULTADOS PERSONALIZADA (Estilo Pop) */}
      {showOptions && options.length > 0 && (
        <ul
          className="pop-options-list"
          style={{ maxHeight: "250px", zIndex: 1000, position: "absolute" }}
        >
          {options.map((place) => (
            <li
              key={place.place_id}
              className="pop-option-item"
              onClick={() => handleSelectOption(place)}
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "2px",
                fontSize: "14px",
              }}
            >
              {/* Texto principal (Nombre del lugar) */}
              <span style={{ fontWeight: 800, color: "#1a1a1a" }}>
                {place.structured_formatting.main_text}
              </span>
              {/* Texto secundario (Dirección) */}
              <span style={{ fontSize: "12px", color: "#666" }}>
                {place.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
          {/* Logo de Google obligatorio por términos de servicio */}
          <li
            style={{
              padding: "4px 10px",
              textAlign: "right",
              borderTop: "1px solid #eee",
            }}
          >
            <img
              src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png"
              alt="Powered by Google"
              style={{ height: "12px", opacity: 0.7 }}
            />
          </li>
        </ul>
      )}
    </div>
  );
};

export default GoogleLocationSearch;
