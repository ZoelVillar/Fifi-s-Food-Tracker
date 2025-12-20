import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import "./PopSelect.css";

const PopSelect = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar el menú si clickeas afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="pop-select-container" ref={containerRef}>
      {/* El botón que se ve */}
      <div
        className={`pop-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="arrow-icon" size={20} strokeWidth={3} />
      </div>

      {/* El menú con animación */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="pop-options-list"
            initial={{ opacity: 0, y: -10, scaleY: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {options.map((option) => (
              <li
                key={option}
                className={`pop-option-item ${
                  value === option ? "selected" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
                {value === option && <Check size={16} strokeWidth={4} />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PopSelect;
