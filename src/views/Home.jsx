import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Pizza } from "lucide-react";
import Header from "../components/Header";
import ReviewForm from "../components/ReviewForm";
import ReviewCard from "../components/ReviewCard";
import { getRecentReviews, deleteReview } from "../services/firestoreService";
import "./Home.css";

const Home = ({ onNavigateToStats }) => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado para manejar la edición
  const [editingReview, setEditingReview] = useState(null);

  const loadRecentReviews = async () => {
    try {
      setLoading(true);
      // Traemos las últimas 5 (o más si querés)
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
    // Si estábamos editando, salimos del modo edición
    setEditingReview(null);
    loadRecentReviews();
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    // El scroll up ya lo hace el ReviewForm con useEffect
  };

  const handleDelete = async (id) => {
    try {
      await deleteReview(id);
      loadRecentReviews();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  return (
    <div className="home-view">
      <Header onStatsClick={onNavigateToStats} />

      <div className="home-content">
        {/* Formulario Principal (Ahora acepta props de edición) */}
        <ReviewForm
          onSaveSuccess={handleSaveSuccess}
          editingReview={editingReview}
          onCancelEdit={handleCancelEdit}
        />

        <div className="divider-pop" />

        <section className="recent-reviews-section">
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
                <ReviewCard
                  key={review.id}
                  review={review}
                  index={index}
                  onEdit={handleEdit} // Pasamos función
                  onDelete={handleDelete} // Pasamos función
                />
              ))}
            </div>
          )}
        </section>

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
