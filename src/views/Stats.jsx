import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Trophy,
  TrendingUp,
  Utensils,
  Award,
  AlertCircle,
} from "lucide-react";
import Header from "../components/Header";
import { getAllReviews } from "../services/firestoreService";
import { CATEGORIES } from "../constants/categories";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import "./Stats.css";

const Stats = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE LA UI ---
  const [activeTab, setActiveTab] = useState("month"); // 'month' | 'history'

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Carga de datos
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (error) {
        console.error("Error cargando reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LÓGICA DE FILTRADO Y PROCESAMIENTO ---

  // 1. Base filtrada por Categoría (Aplica a ambas pestañas)
  const categoryFilteredReviews = useMemo(() => {
    if (selectedCategory === "Todas") return reviews;
    return reviews.filter((r) =>
      r.items?.some((item) => item.category === selectedCategory)
    );
  }, [reviews, selectedCategory]);

  // 2. Datos para la pestaña MES (Filtra por fecha + categoría)
  const monthData = useMemo(() => {
    const filtered = categoryFilteredReviews.filter((r) => {
      if (!r.timestamp) return false;
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      return (
        date.getMonth() + 1 === parseInt(selectedMonth) &&
        date.getFullYear() === parseInt(selectedYear)
      );
    });

    const totalSpent = filtered.reduce(
      (acc, curr) => acc + (curr.price || 0),
      0
    );
    const avgRating =
      filtered.length > 0
        ? filtered.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
          filtered.length
        : 0;

    return {
      reviews: filtered,
      count: filtered.length,
      totalSpent,
      avgRating,
    };
  }, [categoryFilteredReviews, selectedMonth, selectedYear]);

  // 3. Datos para la pestaña HISTÓRICO
  const historyData = useMemo(() => {
    // A. Gráfico de Tendencia (Mensual)
    const trendMap = {};
    categoryFilteredReviews.forEach((r) => {
      if (!r.timestamp) return;
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      // Si filtramos por categoría, contamos items, si no, contamos salidas
      let valueToAdd = 1;
      if (selectedCategory !== "Todas") {
        // Contar cuantos items de esa categoria hubo en la salida
        valueToAdd = r.items.filter(
          (i) => i.category === selectedCategory
        ).length;
      }

      trendMap[key] = (trendMap[key] || 0) + valueToAdd;
    });

    const trendChart = Object.entries(trendMap)
      .map(([date, count]) => ({
        name: date, // YYYY-MM
        shortName: date.split("-")[1] + "/" + date.split("-")[0].slice(2),
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // B. Total Gastado Histórico
    const totalSpentHistory = categoryFilteredReviews.reduce(
      (acc, curr) => acc + (curr.price || 0),
      0
    );

    // C. Top Lugares (Ponderado por cantidad de visitas)
    const placeCount = {};
    categoryFilteredReviews.forEach((r) => {
      if (!r.placeName) return;
      placeCount[r.placeName] = (placeCount[r.placeName] || 0) + 1;
    });

    const topPlaces = Object.entries(placeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // D. Más Cara y Más Barata
    let mostExpensive = null;
    let cheapest = null;

    if (categoryFilteredReviews.length > 0) {
      // Ordenar por precio
      const sortedByPrice = [...categoryFilteredReviews].sort(
        (a, b) => b.price - a.price
      );
      mostExpensive = sortedByPrice[0];
      // Para la más barata, ignoramos precio 0 si existe (invitaciones)
      const withPrice = sortedByPrice.filter((r) => r.price > 0);
      cheapest = withPrice[withPrice.length - 1];
    }

    return {
      trendChart,
      totalSpentHistory,
      topPlaces,
      mostExpensive,
      cheapest,
      totalCount: categoryFilteredReviews.length,
    };
  }, [categoryFilteredReviews, selectedCategory]);

  // --- HELPERS ---
  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

  if (loading)
    return (
      <div className="stats-view">
        <div className="loading-state">Cargando datos...</div>
      </div>
    );

  return (
    <div className="stats-view">
      <Header showStatsButton={false} />

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

        <motion.h1
          className="stats-main-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          ANALIZAME ESTA !!! 💥
        </motion.h1>

        {/* --- BARRA DE FILTROS --- */}
        <div className="filters-bar">
          <div className="filter-group">
            <span className="filter-label">Categoría</span>
            <select
              className="pop-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todas">🍔 Todas</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros de fecha solo visibles en tab Mensual */}
          {activeTab === "month" && (
            <>
              <div className="filter-group">
                <span className="filter-label">Mes</span>
                <select
                  className="pop-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("es-ES", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <span className="filter-label">Año</span>
                <select
                  className="pop-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* --- TABS --- */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "month" ? "active" : ""}`}
            onClick={() => setActiveTab("month")}
          >
            Mensual
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            Histórico
          </button>
        </div>

        {/* --- CONTENIDO PESTAÑA: MENSUAL --- */}
        {activeTab === "month" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="kpi-grid">
              <div className="kpi-box" style={{ background: "#daf5ff" }}>
                <div className="icon-stamp" style={{ background: "#0fbcf9" }}>
                  <Utensils color="white" size={20} strokeWidth={3} />
                </div>
                <div className="kpi-value">{monthData.count}</div>
                <div className="kpi-label">Salidas</div>
              </div>

              <div className="kpi-box" style={{ background: "#fff5da" }}>
                <div className="icon-stamp" style={{ background: "#ffdd59" }}>
                  <DollarSign color="black" size={20} strokeWidth={3} />
                </div>
                <div className="kpi-value">
                  {formatMoney(monthData.totalSpent)}
                </div>
                <div className="kpi-label">Gastado</div>
              </div>

              <div className="kpi-box" style={{ background: "#ffdada" }}>
                <div className="icon-stamp" style={{ background: "#ff5e57" }}>
                  <Award color="white" size={20} strokeWidth={3} />
                </div>
                <div className="kpi-value">
                  {monthData.avgRating.toFixed(1)}
                </div>
                <div className="kpi-label">Rating Prom.</div>
              </div>
            </div>

            {monthData.count === 0 && (
              <div className="empty-msg">
                No hay registros para este mes y categoría. 😴
              </div>
            )}
          </motion.div>
        )}

        {/* --- CONTENIDO PESTAÑA: HISTÓRICO --- */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* KPI TOTAL HISTÓRICO */}
            <div className="pop-card yellow">
              <div className="card-title">
                <TrendingUp size={24} strokeWidth={3} />
                Total Histórico ({selectedCategory})
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#666",
                    }}
                  >
                    GASTO TOTAL
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "800",
                      color: "#1a1a1a",
                    }}
                  >
                    {formatMoney(historyData.totalSpentHistory)}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#666",
                    }}
                  >
                    CANTIDAD
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "800",
                      color: "#1a1a1a",
                    }}
                  >
                    {historyData.totalCount}
                  </div>
                </div>
              </div>
            </div>

            {/* GRÁFICO DE TENDENCIA */}
            <div className="pop-card blue">
              <div className="card-title">
                <Calendar size={24} strokeWidth={3} />
                Evolución{" "}
                {selectedCategory === "Todas" ? "Salidas" : selectedCategory}
              </div>
              <div style={{ height: 300, width: "100%" }}>
                <ResponsiveContainer>
                  <LineChart data={historyData.trendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="shortName"
                      stroke="#1a1a1a"
                      tick={{ fontFamily: "Fredoka", fontWeight: 600 }}
                    />
                    <YAxis stroke="#1a1a1a" tick={{ fontFamily: "Fredoka" }} />
                    <Tooltip
                      contentStyle={{
                        border: "3px solid black",
                        borderRadius: "8px",
                        boxShadow: "4px 4px 0px black",
                        fontFamily: "Fredoka",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0fbcf9"
                      strokeWidth={4}
                      dot={{
                        r: 6,
                        fill: "#1a1a1a",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 8, fill: "#ffdd59", stroke: "#1a1a1a" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* TOP PLACES */}
              <div className="pop-card purple">
                <div className="card-title">
                  <Trophy size={24} strokeWidth={3} />
                  Top {selectedCategory}
                </div>
                {historyData.topPlaces.length > 0 ? (
                  <ul className="top-list">
                    {historyData.topPlaces.map((place, idx) => (
                      <li key={idx} className="top-item">
                        <div className="rank-circle">#{idx + 1}</div>
                        <div className="top-info">
                          <div className="top-name">{place.name}</div>
                          <div className="top-count">{place.count} visitas</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-msg">Sin datos aún</div>
                )}
              </div>

              {/* EXTREMOS (CARO / BARATO) */}
              <div className="pop-card green">
                <div className="card-title">
                  <AlertCircle size={24} strokeWidth={3} />
                  Extremos
                </div>
                <div className="extremes-grid">
                  <div className="extreme-item">
                    <span className="extreme-badge badge-expensive">
                      MÁS CARO
                    </span>
                    {historyData.mostExpensive ? (
                      <>
                        <span className="extreme-name">
                          {historyData.mostExpensive.placeName}
                        </span>
                        <span className="extreme-price">
                          {formatMoney(historyData.mostExpensive.price)}
                        </span>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                  <div className="extreme-item">
                    <span className="extreme-badge badge-cheap">
                      MÁS BARATO
                    </span>
                    {historyData.cheapest ? (
                      <>
                        <span className="extreme-name">
                          {historyData.cheapest.placeName}
                        </span>
                        <span className="extreme-price">
                          {formatMoney(historyData.cheapest.price)}
                        </span>
                      </>
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Stats;
