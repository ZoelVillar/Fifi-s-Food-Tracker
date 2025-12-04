import { motion } from "framer-motion";
import { BarChart3, UtensilsCrossed } from "lucide-react"; // Agregué un icono extra para el título
import "./Header.css";

const Header = ({ onStatsClick, showStatsButton = true }) => {
  return (
    <motion.header
      className="app-header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="header-content">
        <div className="logo-container">
          <div className="logo-icon-bg">
            <UtensilsCrossed size={20} color="#fff" />
          </div>
          <h1 className="app-title">
            Food<span className="text-gradient">Wrapped</span>
          </h1>
        </div>

        {showStatsButton && (
          <motion.button
            className="stats-button"
            onClick={onStatsClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <BarChart3 size={20} strokeWidth={2.5} />
            <span className="btn-text">Análisis</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
