import { motion } from "framer-motion";
import { BarChart3, UtensilsCrossed } from "lucide-react";
import "./Header.css";

const Header = ({ onStatsClick, showStatsButton = true }) => {
  // Función básica para volver arriba o al inicio si estamos en stats
  // Nota: En una app con routing de verdad usaríamos useNavigate o Link
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Si tenés una prop para navegar a home, usala acá.
    // Por ahora es solo estético o para scrollear arriba.
  };

  return (
    <motion.header
      className="app-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="header-content">
        <div className="logo-container" onClick={handleLogoClick}>
          <div className="logo-icon-bg">
            <UtensilsCrossed size={22} color="#1a1a1a" strokeWidth={2.5} />
          </div>
          <h1 className="app-title">
            Fifi's<span className="text-pop">Food</span>
          </h1>
        </div>

        {showStatsButton && (
          <motion.button
            className="stats-button"
            onClick={onStatsClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 size={20} />
            <span className="btn-text">Análisis</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
