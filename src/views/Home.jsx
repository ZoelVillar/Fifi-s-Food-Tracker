import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Pizza, Search } from "lucide-react"; // Iconos divertidos
import Header from "../components/Header";
import ReviewForm from "../components/ReviewForm";
import ReviewCard from "../components/ReviewCard";
import { getRecentReviews } from "../services/firestoreService";
import "./Home.css";

const Home = ({ onNavigateToStats }) => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecentReviews = async () => {
    try {
      setLoading(true);
      // Traemos las últimas 5 para que el feed no sea infinito
      const reviews = await getRecentReviews(5);
      setRecentReviews(reviews);
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentReviews();
  }, []);

  const handleSaveSuccess = () => {
    loadRecentReviews();
    // Scroll suave hacia abajo para ver tu nueva reseña (opcional)
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="home-view">
      <Header onStatsClick={onNavigateToStats} />

      <div className="home-content">
        {/* Formulario Principal */}
        <ReviewForm onSaveSuccess={handleSaveSuccess} />

        {/* Separador Estilo Cinta de Precaución */}
        <div className="divider-pop" />

        <section className="recent-reviews-section">
          {/* Título Decorado */}
          <div className="section-header">
            <Sparkles className="title-icon" size={32} />
            <h2 className="section-title">Últimos Hits</h2>
            <Sparkles className="title-icon" size={32} />
          </div>

          {loading ? (
            <motion.div
              className="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Buscando en la cocina... 🍳
            </motion.div>
          ) : recentReviews.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Pizza
                size={48}
                color="white"
                strokeWidth={3}
                style={{ filter: "drop-shadow(3px 3px 0px #1a1a1a)" }}
              />
              <p>¡Está muy vacío aquí!</p>
              <span style={{ fontSize: "14px", fontWeight: "600" }}>
                Agrega tu primera salida arriba ☝️
              </span>
            </motion.div>
          ) : (
            <div className="reviews-list">
              {recentReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          )}
        </section>

        {/* Footer simple para cerrar */}
        {!loading && recentReviews.length > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              opacity: 0.5,
              fontWeight: "bold",
            }}
          >
            ——— FIN DEL MENÚ ———
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
