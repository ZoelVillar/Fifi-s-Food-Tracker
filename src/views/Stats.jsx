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
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import Header from "../components/Header";
import PopSelect from "../components/PopSelect"; // <--- IMPORTANTE: Importamos el componente Pop
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
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import "./Stats.css";

// Paleta de colores para gráficos (Estilo Pop)
const COLORS = [
  "#0fbcf9",
  "#ffdd59",
  "#ff5e57",
  "#00d2d3",
  "#a55eea",
  "#ff9f43",
  "#ff9ff3",
];

const Stats = ({ onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE LA UI ---
  const [activeTab, setActiveTab] = useState("month"); // 'month' | 'history'
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Datos auxiliares para los selectores
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Opciones combinadas para categorías
  const categoryOptions = ["Todas", ...CATEGORIES];

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

  // --- LÓGICA DE DATOS ---

  // 1. Filtro base
  const categoryFilteredReviews = useMemo(() => {
    if (selectedCategory === "Todas") return reviews;
    return reviews.filter((r) =>
      r.items?.some((item) => item.category === selectedCategory)
    );
  }, [reviews, selectedCategory]);

  // 2. Datos MENSUALES
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

    // A. Distribución de Categorías (Solo si estamos viendo "Todas")
    let categoryPieData = [];
    if (selectedCategory === "Todas") {
      const catCount = {};
      filtered.forEach((r) => {
        r.items?.forEach((item) => {
          catCount[item.category] = (catCount[item.category] || 0) + 1;
        });
      });
      categoryPieData = Object.entries(catCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 para no saturar
    }

    return {
      reviews: filtered,
      count: filtered.length,
      totalSpent,
      avgRating,
      categoryPieData,
    };
  }, [categoryFilteredReviews, selectedMonth, selectedYear, selectedCategory]);

  // 3. Datos HISTÓRICOS (Avanzados)
  const historyData = useMemo(() => {
    // A. Tendencia
    const trendMap = {};
    // B. Día de la Semana
    const daysMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=Domingo
    const dayNamesChart = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    // C. Distribución de Ratings
    const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    // D. Scatter (Precio vs Rating)
    const scatterPoints = [];

    // E. Total y Extremos
    let totalSpentHistory = 0;
    const placeCount = {};

    categoryFilteredReviews.forEach((r) => {
      // Precio y Totales
      const price = r.price || 0;
      totalSpentHistory += price;

      if (!r.timestamp) return;
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);

      // Tendencia
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      let valueToAdd = 1;
      if (selectedCategory !== "Todas") {
        valueToAdd = r.items.filter(
          (i) => i.category === selectedCategory
        ).length;
      }
      trendMap[key] = (trendMap[key] || 0) + valueToAdd;

      // Día de la Semana
      daysMap[date.getDay()] += 1;

      // Rating Distribution
      const roundedRating = Math.round(r.rating || 0);
      if (roundedRating >= 1 && roundedRating <= 5)
        ratingMap[roundedRating] += 1;

      // Scatter Plot Data (Solo si tiene precio y rating)
      if (price > 0 && r.rating > 0) {
        scatterPoints.push({
          x: price,
          y: r.rating,
          z: 10, // Tamaño del punto
          name: r.placeName || "Lugar",
        });
      }

      // Top Places
      if (r.placeName)
        placeCount[r.placeName] = (placeCount[r.placeName] || 0) + 1;
    });

    // Formatear Tendencia
    const trendChart = Object.entries(trendMap)
      .map(([date, count]) => ({
        name: date,
        shortName: date.split("-")[1] + "/" + date.split("-")[0].slice(2),
        count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Formatear Días Semana
    const dayOfWeekChart = Object.entries(daysMap).map(([dayIndex, count]) => ({
      name: dayNamesChart[dayIndex],
      count,
      fullMark: 100, // Para radar chart visual
    }));

    // Formatear Ratings
    const ratingChart = Object.entries(ratingMap).map(([stars, count]) => ({
      name: stars + "★",
      count,
    }));

    // Top Places
    const topPlaces = Object.entries(placeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Extremos
    let mostExpensive = null;
    let cheapest = null;
    if (categoryFilteredReviews.length > 0) {
      const sortedByPrice = [...categoryFilteredReviews].sort(
        (a, b) => b.price - a.price
      );
      mostExpensive = sortedByPrice[0];
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
      dayOfWeekChart,
      ratingChart,
      scatterPoints,
    };
  }, [categoryFilteredReviews, selectedCategory]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

  // Custom Tooltip para el Scatter Plot
  const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            background: "#fff",
            border: "3px solid #1a1a1a",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "4px 4px 0 #1a1a1a",
          }}
        >
          <p style={{ fontWeight: "bold", margin: 0 }}>{data.name}</p>
          <p style={{ margin: 0 }}>Precio: {formatMoney(data.x)}</p>
          <p style={{ margin: 0 }}>Rating: {data.y} ★</p>
        </div>
      );
    }
    return null;
  };

  if (loading)
    return (
      <div className="stats-view">
        <div className="loading-state">Calculando datos... 🧮</div>
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
          ANÁLISIS POP 💥
        </motion.h1>

        {/* --- FILTROS (AHORA CON POPSELECT) --- */}
        <div className="filters-bar">
          {/* Selector de Categoría */}
          <div className="filter-group">
            <span className="filter-label">Categoría</span>
            <div style={{ width: "200px" }}>
              {" "}
              {/* Contenedor para controlar ancho */}
              <PopSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Seleccionar..."
              />
            </div>
          </div>

          {activeTab === "month" && (
            <>
              {/* Selector de Mes */}
              <div className="filter-group">
                <span className="filter-label">Mes</span>
                <div style={{ width: "160px" }}>
                  <PopSelect
                    options={monthNames}
                    value={monthNames[selectedMonth - 1]} // Mostramos el nombre (ej: "Diciembre")
                    onChange={(val) =>
                      setSelectedMonth(monthNames.indexOf(val) + 1)
                    } // Guardamos el número (ej: 12)
                    placeholder="Mes"
                  />
                </div>
              </div>

              {/* Selector de Año */}
              <div className="filter-group">
                <span className="filter-label">Año</span>
                <div style={{ width: "120px" }}>
                  <PopSelect
                    options={["2024", "2025"]}
                    value={String(selectedYear)}
                    onChange={(val) => setSelectedYear(parseInt(val))}
                    placeholder="Año"
                  />
                </div>
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

        {/* --- PESTAÑA: MENSUAL --- */}
        {activeTab === "month" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* 1. KPIs */}
            <div className="kpi-grid">
              <div className="kpi-box" style={{ background: "#daf5ff" }}>
                <div className="icon-stamp" style={{ background: "#0fbcf9" }}>
                  <Utensils color="white" size={20} />
                </div>
                <div className="kpi-value">{monthData.count}</div>
                <div className="kpi-label">Salidas</div>
              </div>
              <div className="kpi-box" style={{ background: "#fff5da" }}>
                <div className="icon-stamp" style={{ background: "#ffdd59" }}>
                  <DollarSign color="black" size={20} />
                </div>
                <div className="kpi-value">
                  {formatMoney(monthData.totalSpent)}
                </div>
                <div className="kpi-label">Gastado</div>
              </div>
              <div className="kpi-box" style={{ background: "#ffdada" }}>
                <div className="icon-stamp" style={{ background: "#ff5e57" }}>
                  <Award color="white" size={20} />
                </div>
                <div className="kpi-value">
                  {monthData.avgRating.toFixed(1)}
                </div>
                <div className="kpi-label">Rating Prom.</div>
              </div>
            </div>

            {/* 2. GRÁFICO DE TORTA (Solo si hay datos y cat=Todas) */}
            {monthData.count > 0 &&
              selectedCategory === "Todas" &&
              monthData.categoryPieData.length > 0 && (
                <div className="pop-card orange">
                  <div className="card-title">
                    <PieIcon size={24} strokeWidth={3} /> Dieta Mensual
                  </div>
                  <div className="chart-container" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthData.categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {monthData.categoryPieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="#1a1a1a"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            border: "3px solid black",
                            borderRadius: "8px",
                            fontFamily: "Fredoka",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Leyenda Manual Estilo Pop */}
                  <div className="custom-legend">
                    {monthData.categoryPieData.map((entry, index) => (
                      <div
                        key={index}
                        className="legend-pill"
                        style={{
                          background: COLORS[index % COLORS.length] + "40",
                        }}
                      >
                        <div
                          className="legend-dot"
                          style={{ background: COLORS[index % COLORS.length] }}
                        />
                        {entry.name} ({entry.value})
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {monthData.count === 0 && (
              <div className="empty-msg">
                No hay registros para este mes. 😴
              </div>
            )}
          </motion.div>
        )}

        {/* --- PESTAÑA: HISTÓRICO --- */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* KPI TOTAL */}
            <div className="pop-card yellow">
              <div className="card-title">
                <TrendingUp size={24} strokeWidth={3} /> Total Histórico (
                {selectedCategory})
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

            {/* GRÁFICO 1: TENDENCIA (Línea) */}
            <div className="pop-card blue">
              <div className="card-title">
                <Calendar size={24} strokeWidth={3} /> Tendencia de Salidas
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData.trendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="shortName"
                      stroke="#1a1a1a"
                      tick={{ fontFamily: "Fredoka", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#1a1a1a"
                      tick={{ fontFamily: "Fredoka", fontSize: 12 }}
                      width={30}
                    />
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

            {/* GRÁFICO 2: PRECIO VS CALIDAD (Scatter) */}
            {historyData.scatterPoints.length > 2 && (
              <div className="pop-card pink">
                <div className="card-title">
                  <ScatterIcon size={24} strokeWidth={3} /> Precio vs. Calidad
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontStyle: "italic",
                    marginBottom: "10px",
                  }}
                >
                  ¿Pagas más por mejor comida? (Arriba a la izq: Bueno y Barato)
                </p>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Precio"
                        unit="$"
                        stroke="#1a1a1a"
                        tickFormatter={(val) => `$${val}`}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Rating"
                        unit="★"
                        stroke="#1a1a1a"
                        domain={[1, 5]}
                      />
                      <ZAxis type="number" dataKey="z" range={[60, 400]} />{" "}
                      {/* Tamaño de burbujas */}
                      <Tooltip content={<CustomScatterTooltip />} />
                      <Scatter
                        name="Lugares"
                        data={historyData.scatterPoints}
                        fill="#ff5e57"
                        shape="circle"
                        stroke="#1a1a1a"
                        strokeWidth={2}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* GRÁFICO 3: DÍAS DE LA SEMANA (Barras) */}
              <div className="pop-card cyan">
                <div className="card-title">
                  <BarChartIcon size={24} strokeWidth={3} /> Ritmo Semanal
                </div>
                <div className="chart-container" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData.dayOfWeekChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#1a1a1a"
                        tick={{ fontSize: 12, fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                          border: "3px solid black",
                          borderRadius: "8px",
                          fontFamily: "Fredoka",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#00d2d3"
                        radius={[4, 4, 0, 0]}
                        stroke="#1a1a1a"
                        strokeWidth={2}
                      >
                        {historyData.dayOfWeekChart.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.count > 0 ? "#00d2d3" : "#e0e0e0"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GRÁFICO 4: DISTRIBUCIÓN DE RATING */}
              <div className="pop-card purple">
                <div className="card-title">
                  <Award size={24} strokeWidth={3} /> Tus Veredictos
                </div>
                <div className="chart-container" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData.ratingChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke="#1a1a1a" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#1a1a1a"
                        width={40}
                        tick={{ fontWeight: "bold" }}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{
                          border: "3px solid black",
                          borderRadius: "8px",
                          fontFamily: "Fredoka",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#a55eea"
                        radius={[0, 4, 4, 0]}
                        stroke="#1a1a1a"
                        strokeWidth={2}
                        barSize={20}
                      ></Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* TOP PLACES Y EXTREMOS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginTop: "20px",
              }}
            >
              <div className="pop-card orange">
                <div className="card-title">
                  <Trophy size={24} strokeWidth={3} /> Top {selectedCategory}
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

              <div className="pop-card green">
                <div className="card-title">
                  <AlertCircle size={24} strokeWidth={3} /> Extremos
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
