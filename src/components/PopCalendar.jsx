import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "./PopCalendar.css";

const PopCalendar = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDate = (day) => {
    // Formatear a YYYY-MM-DD para mantener consistencia con los inputs de fecha
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const formattedDate = newDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Nombres de los meses y días para la UI
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

  // Formatear el valor visible en el input
  const displayValue = value 
    ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value + 'T00:00:00')) 
    : "Seleccionar fecha...";

  return (
    <div className="pop-calendar-container" ref={containerRef}>
      {/* EL TRIGGER (Imita al modern-input) */}
      <div 
        className={`pop-calendar-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="input-icon" size={20} strokeWidth={3} />
        <span className="trigger-text">{displayValue}</span>
      </div>

      {/* EL POPUP DEL CALENDARIO */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="pop-calendar-modal"
            initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="pop-calendar-header">
              <button type="button" onClick={handlePrevMonth} className="nav-btn">
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <span className="month-year-label">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <button type="button" onClick={handleNextMonth} className="nav-btn">
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="pop-calendar-grid">
              {/* Días de la semana */}
              {dayNames.map(day => (
                <div key={day} className="day-name">{day}</div>
              ))}

              {/* Espacios vacíos del primer mes */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="day-cell empty"></div>
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = value === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                return (
                  <button
                    key={day}
                    type="button"
                    className={`day-cell ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectDate(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PopCalendar;