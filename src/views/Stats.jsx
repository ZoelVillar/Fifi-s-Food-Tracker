import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, DollarSign, Calendar } from 'lucide-react';
import Header from '../components/Header';
import { getAllReviews } from '../services/firestoreService';
import { CATEGORIES } from '../constants/categories';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Stats.css';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#95A5A6'
];

const Stats = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAllReviews();
  }, []);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const allReviews = await getAllReviews();
      setReviews(allReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para estadísticas
  const getCurrentMonthData = () => {
    const monthReviews = reviews.filter(review => {
      if (!review.timestamp) return false;
      const date = review.timestamp.toDate ? review.timestamp.toDate() : new Date(review.timestamp);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });

    const totalOutings = monthReviews.length;
    const avgRating = totalOutings > 0
      ? monthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalOutings
      : 0;
    const totalSpent = monthReviews.reduce((sum, r) => sum + (r.price || 0), 0);

    return { totalOutings, avgRating, totalSpent };
  };

  // Gráfico de tendencia mensual
  const getMonthlyTrendData = () => {
    const monthlyData = {};
    
    reviews.forEach(review => {
      if (!review.timestamp) return;
      const date = review.timestamp.toDate ? review.timestamp.toDate() : new Date(review.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey]++;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: month.split('-')[1] + '/' + month.split('-')[0].slice(2),
        count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Últimos 12 meses
  };

  // Gráfico de categorías (pie chart)
  const getCategoryData = () => {
    const categoryCount = {};
    
    reviews.forEach(review => {
      if (review.items && review.items.length > 0) {
        review.items.forEach(item => {
          const category = item.category || 'Otro';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
      }
    });

    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Top 3 lugares por rating
  const getTopPlaces = () => {
    const placeRatings = {};
    
    reviews.forEach(review => {
      if (!review.placeName || !review.rating) return;
      const place = review.placeName;
      
      if (!placeRatings[place]) {
        placeRatings[place] = { totalRating: 0, count: 0, reviews: [] };
      }
      placeRatings[place].totalRating += review.rating;
      placeRatings[place].count++;
      placeRatings[place].reviews.push(review);
    });

    return Object.entries(placeRatings)
      .map(([place, data]) => ({
        place,
        avgRating: data.totalRating / data.count,
        count: data.count,
        reviews: data.reviews
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 3);
  };

  // Día favorito para salir
  const getFavoriteDay = () => {
    const dayCount = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    reviews.forEach(review => {
      if (!review.timestamp) return;
      const date = review.timestamp.toDate ? review.timestamp.toDate() : new Date(review.timestamp);
      const dayName = dayNames[date.getDay()];
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    });

    const favorite = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    return favorite ? { day: favorite[0], count: favorite[1] } : null;
  };

  if (loading) {
    return (
      <div className="stats-view">
        <div className="loading-state">Cargando estadísticas...</div>
      </div>
    );
  }

  const monthData = getCurrentMonthData();
  const trendData = getMonthlyTrendData();
  const categoryData = getCategoryData();
  const topPlaces = getTopPlaces();
  const favoriteDay = getFavoriteDay();

  return (
    <div className="stats-view">
      <Header onStatsClick={null} showStatsButton={false} />
      
      <div className="stats-content">
        <motion.button
          className="back-button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </motion.button>

        <motion.div
          className="stats-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="stats-title">📊 Tu Análisis Anual</h1>
          <p className="stats-subtitle">Descubre tus hábitos gastronómicos</p>
        </motion.div>

        {/* KPIs Mensuales */}
        <div className="kpi-grid">
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{monthData.totalOutings}</div>
              <div className="kpi-label">Salidas este mes</div>
            </div>
          </motion.div>

          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Star size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">{monthData.avgRating.toFixed(1)}</div>
              <div className="kpi-label">Promedio de puntaje</div>
            </div>
          </motion.div>

          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="kpi-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <DollarSign size={24} />
            </div>
            <div className="kpi-content">
              <div className="kpi-value">${monthData.totalSpent.toFixed(2)}</div>
              <div className="kpi-label">Total gastado</div>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Gráfico de Tendencia */}
          <motion.div
            className="bento-card bento-large"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="chart-title">Tendencia Mensual</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Gráfico de Categorías */}
          <motion.div
            className="bento-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="chart-title">Categorías Favoritas</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No hay datos de categorías</div>
            )}
          </motion.div>

          {/* Top 3 Lugares */}
          <motion.div
            className="bento-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="chart-title">🏆 Top 3 Lugares</h3>
            <div className="top-places">
              {topPlaces.length > 0 ? (
                topPlaces.map((place, index) => (
                  <div key={place.place} className="top-place-item">
                    <div className="place-rank">{index + 1}</div>
                    <div className="place-info">
                      <div className="place-name">{place.place}</div>
                      <div className="place-rating">
                        ⭐ {place.avgRating.toFixed(1)} ({place.count} visitas)
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-chart">No hay lugares calificados aún</div>
              )}
            </div>
          </motion.div>

          {/* Dato Curioso */}
          {favoriteDay && (
            <motion.div
              className="bento-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="chart-title">💡 Dato Curioso</h3>
              <div className="fun-fact">
                <div className="fun-fact-value">{favoriteDay.day}</div>
                <div className="fun-fact-label">
                  es tu día favorito para salir ({favoriteDay.count} veces)
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;

