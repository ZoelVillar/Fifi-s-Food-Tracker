import { useEffect, useState, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin, X, Loader2 } from "lucide-react";
import "./ReviewForm.css";
import "./PopSelect.css";

const GoogleLocationSearch = ({ value, onChange }) => {
  // Empezamos con el valor que nos pasan
  const [inputValue, setInputValue] = useState(value || "");
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const placesLibrary = useMapsLibrary("places");
  const autocompleteService = useRef(null);
  const sessionToken = useRef(null);
  const wrapperRef = useRef(null);

  // Sincronizar con el padre: si limpia el valor, nosotros también
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Inicializar servicio de Google Places
  useEffect(() => {
    if (!placesLibrary) return;
    autocompleteService.current = new placesLibrary.AutocompleteService();
    sessionToken.current = new placesLibrary.AutocompleteSessionToken();
  }, [placesLibrary]);

  // Cerrar lista si clickean afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar lo que escribe el usuario
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val); // Actualizamos el input visual

    // Si borra todo manualmente
    if (!val) {
      setOptions([]);
      setShowOptions(false);
      onChange(""); // Avisamos al padre
      return;
    }

    // No llamamos onChange para no guardar texto parcial
    // Solo guardamos al seleccionar opción

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
    const fullText = place.description; // Ej: "Antares, Armenia, Palermo..."

    // Actualizamos estado interno y avisamos al padre
    setInputValue(fullText);
    onChange(fullText);
    setShowOptions(false);

    // Nuevo token para la próxima búsqueda
    if (placesLibrary) {
      sessionToken.current = new placesLibrary.AutocompleteSessionToken();
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
    setOptions([]);
    setShowOptions(false);
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

        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "14px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                color: "#1a1a1a",
              }}
            >
              <X size={16} strokeWidth={3} />
            </button>
          ) : null}
        </div>
      </div>

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
              <span style={{ fontWeight: 800, color: "#1a1a1a" }}>
                {place.structured_formatting.main_text}
              </span>
              <span style={{ fontSize: "12px", color: "#666" }}>
                {place.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
          <li
            style={{
              padding: "4px 10px",
              textAlign: "right",
              borderTop: "1px solid #eee",
              background: "#fafafa",
            }}
          >
            <img
              src="https://developers.google.com/static/maps/documentation/images/powered_by_google_on_white.png"
              alt="Powered by Google"
              style={{ height: "10px", opacity: 0.8 }}
            />
          </li>
        </ul>
      )}
    </div>
  );
};

export default GoogleLocationSearch;
