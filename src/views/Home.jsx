import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ReviewForm from '../components/ReviewForm';
import ReviewCard from '../components/ReviewCard';
import { getRecentReviews } from '../services/firestoreService';
import './Home.css';

const Home = ({ onNavigateToStats }) => {
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecentReviews = async () => {
    try {
      setLoading(true);
      const reviews = await getRecentReviews(5);
      setRecentReviews(reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentReviews();
  }, []);

  const handleSaveSuccess = () => {
    loadRecentReviews();
  };

  return (
    <div className="home-view">
      <Header onStatsClick={onNavigateToStats} />
      
      <div className="home-content">
        <ReviewForm onSaveSuccess={handleSaveSuccess} />
        
        <section className="recent-reviews-section">
          <h2 className="section-title">Últimas Reseñas</h2>
          {loading ? (
            <div className="loading-state">Cargando...</div>
          ) : recentReviews.length === 0 ? (
            <div className="empty-state">
              <p>No hay reseñas aún. ¡Agrega tu primera salida! 🍽️</p>
            </div>
          ) : (
            <div className="reviews-list">
              {recentReviews.map((review, index) => (
                <ReviewCard key={review.id} review={review} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;

