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
import PopSelect from "../components/PopSelect";
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

  // Fechas por defecto
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Datos auxiliares
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

  // --- LÓGICA DE AÑOS DISPONIBLES (Requerimiento 3) ---
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    if (reviews.length === 0) return [String(currentYear)];

    // Extraer años únicos de las reseñas
    const years = new Set(
      reviews.map((r) => {
        if (!r.timestamp) return currentYear;
        return r.timestamp.toDate
          ? r.timestamp.toDate().getFullYear()
          : new Date(r.timestamp).getFullYear();
      })
    );

    // Asegurar que el año actual esté siempre disponible aunque no haya reseñas aún
    years.add(currentYear);

    // Retornar ordenados descendente (2025, 2024...)
    return Array.from(years)
      .sort((a, b) => b - a)
      .map(String);
  }, [reviews]);

  // --- LÓGICA DE DATOS ---

  // 1. Filtro base por CATEGORÍA
  const categoryFilteredReviews = useMemo(() => {
    if (selectedCategory === "Todas") return reviews;
    return reviews.filter((r) =>
      r.items?.some((item) => item.category === selectedCategory)
    );
  }, [reviews, selectedCategory]);

  // 2. Filtro intermedio por AÑO (Para la pestaña Histórico/Anual)
  const yearFilteredReviews = useMemo(() => {
    return categoryFilteredReviews.filter((r) => {
      if (!r.timestamp) return false;
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      return date.getFullYear() === parseInt(selectedYear);
    });
  }, [categoryFilteredReviews, selectedYear]);

  // 3. Datos MENSUALES (Micro detalle)
  const monthData = useMemo(() => {
    const filtered = yearFilteredReviews.filter((r) => {
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      return date.getMonth() + 1 === parseInt(selectedMonth);
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

    // A. Distribución de Categorías (Diet)
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
        .slice(0, 6);
    }

    // B. Ritmo Semanal (Requerimiento 1: Movido a Mensual)
    const daysMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0=Domingo
    const dayNamesChart = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    filtered.forEach((r) => {
      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);
      daysMap[date.getDay()] += 1;
    });

    const dayOfWeekChart = Object.entries(daysMap).map(([dayIndex, count]) => ({
      name: dayNamesChart[dayIndex],
      count,
    }));

    return {
      reviews: filtered,
      count: filtered.length,
      totalSpent,
      avgRating,
      categoryPieData,
      dayOfWeekChart,
    };
  }, [yearFilteredReviews, selectedMonth, selectedCategory]);

  // 4. Datos ANUALES / HISTÓRICOS (Macro detalle)
  const historyData = useMemo(() => {
    // Usamos yearFilteredReviews para respetar el filtro de Año

    // A. Frecuencia Mensual (Requerimiento 2)
    const monthsMap = {};
    monthNames.forEach((m, i) => (monthsMap[i] = 0)); // Inicializar 0-11

    // B. Distribución de Ratings
    const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // C. Scatter
    const scatterPoints = [];

    // D. Totales y Lugares
    let totalSpentHistory = 0;
    const placeCount = {};

    yearFilteredReviews.forEach((r) => {
      const price = r.price || 0;
      totalSpentHistory += price;

      const date = r.timestamp.toDate
        ? r.timestamp.toDate()
        : new Date(r.timestamp);

      // Conteo por Mes (Ene, Feb...)
      monthsMap[date.getMonth()] += 1;

      // Rating
      const roundedRating = Math.round(r.rating || 0);
      if (roundedRating >= 1 && roundedRating <= 5)
        ratingMap[roundedRating] += 1;

      // Scatter
      if (price > 0 && r.rating > 0) {
        scatterPoints.push({
          x: price,
          y: r.rating,
          z: 10,
          name: r.placeName || "Lugar",
        });
      }

      // Top Places
      if (r.placeName)
        placeCount[r.placeName] = (placeCount[r.placeName] || 0) + 1;
    });

    // Formatear Gráfico Mensual
    const monthlyBarChart = Object.entries(monthsMap).map(([index, count]) => ({
      name: monthNames[index].substring(0, 3), // "Ene", "Feb"
      fullName: monthNames[index],
      count,
    }));

    // Formatear Ratings (5 arriba)
    const ratingChart = Object.entries(ratingMap)
      .map(([stars, count]) => ({ name: stars + "★", count }))
      .reverse();

    // Top Places
    const topPlaces = Object.entries(placeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Extremos
    let mostExpensive = null;
    let cheapest = null;
    if (yearFilteredReviews.length > 0) {
      const sortedByPrice = [...yearFilteredReviews].sort(
        (a, b) => b.price - a.price
      );
      mostExpensive = sortedByPrice[0];
      const withPrice = sortedByPrice.filter((r) => r.price > 0);
      cheapest = withPrice[withPrice.length - 1];
    }

    return {
      monthlyBarChart,
      totalSpentHistory,
      topPlaces,
      mostExpensive,
      cheapest,
      totalCount: yearFilteredReviews.length,
      ratingChart,
      scatterPoints,
    };
  }, [yearFilteredReviews, monthNames]);

  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);

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
          ANALIZAME ESTA !!! 💥
        </motion.h1>

        {/* --- FILTROS --- */}
        <div className="filters-bar">
          {/* 1. Categoría (Siempre visible) */}
          <div className="filter-group">
            <span className="filter-label">Categoría</span>
            <div style={{ width: "200px" }}>
              <PopSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Seleccionar..."
              />
            </div>
          </div>

          {/* 2. Año (Visible en AMBAS pestañas ahora) */}
          <div className="filter-group">
            <span className="filter-label">Año</span>
            <div style={{ width: "120px" }}>
              <PopSelect
                options={availableYears}
                value={String(selectedYear)}
                onChange={(val) => setSelectedYear(parseInt(val))}
                placeholder="Año"
              />
            </div>
          </div>

          {/* 3. Mes (Solo en Pestaña Mensual) */}
          {activeTab === "month" && (
            <div className="filter-group">
              <span className="filter-label">Mes</span>
              <div style={{ width: "160px" }}>
                <PopSelect
                  options={monthNames}
                  value={monthNames[selectedMonth - 1]}
                  onChange={(val) =>
                    setSelectedMonth(monthNames.indexOf(val) + 1)
                  }
                  placeholder="Mes"
                />
              </div>
            </div>
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
            Histórico ({selectedYear})
          </button>
        </div>

        {/* --- PESTAÑA: MENSUAL --- */}
        {activeTab === "month" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* KPI Grid */}
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

            {/* Contenedor Grid para gráficos Mensuales */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {/* GRÁFICO 1: Ritmo Semanal (MOVIDO AQUÍ) */}
              <div className="pop-card cyan">
                <div className="card-title">
                  <BarChartIcon size={24} strokeWidth={3} /> Ritmo Semanal
                </div>
                <div className="chart-container" style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthData.dayOfWeekChart}>
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
                        {monthData.dayOfWeekChart.map((entry, index) => (
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

              {/* GRÁFICO 2: Torta de Dieta (Si corresponde) */}
              {monthData.count > 0 &&
                selectedCategory === "Todas" &&
                monthData.categoryPieData.length > 0 && (
                  <div className="pop-card orange">
                    <div className="card-title">
                      <PieIcon size={24} strokeWidth={3} /> Dieta Mensual
                    </div>
                    <div className="chart-container" style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={monthData.categoryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
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
                  </div>
                )}
            </div>

            {monthData.count === 0 && (
              <div className="empty-msg">No hay registros este mes. 😴</div>
            )}
          </motion.div>
        )}

        {/* --- PESTAÑA: HISTÓRICO (ANUAL) --- */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* KPI TOTAL ANUAL */}
            <div className="pop-card yellow">
              <div className="card-title">
                <TrendingUp size={24} strokeWidth={3} /> Resumen {selectedYear}{" "}
                ({selectedCategory})
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
                    GASTO ANUAL
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
                    TOTAL SALIDAS
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

            {/* GRÁFICO 1: Frecuencia Mensual (NUEVO) */}
            <div className="pop-card blue">
              <div className="card-title">
                <Calendar size={24} strokeWidth={3} /> Frecuencia Mensual
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historyData.monthlyBarChart}>
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
                      fill="#0fbcf9"
                      radius={[4, 4, 0, 0]}
                      stroke="#1a1a1a"
                      strokeWidth={2}
                    >
                      {historyData.monthlyBarChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.count > 0 ? "#0fbcf9" : "#e0e0e0"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
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
              {/* GRÁFICO: DISTRIBUCIÓN DE RATING */}
              <div className="pop-card purple">
                <div className="card-title">
                  <Award size={24} strokeWidth={3} /> Veredictos del Año
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

              {/* GRÁFICO: PRECIO VS CALIDAD */}
              {historyData.scatterPoints.length > 2 && (
                <div className="pop-card pink">
                  <div className="card-title">
                    <ScatterIcon size={24} strokeWidth={3} /> Precio vs. Calidad
                  </div>
                  <div className="chart-container" style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          dataKey="x"
                          unit="$"
                          stroke="#1a1a1a"
                          tickFormatter={(val) => `$${val}`}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          unit="★"
                          stroke="#1a1a1a"
                          domain={[1, 5]}
                        />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} />
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
                  <AlertCircle size={24} strokeWidth={3} /> Extremos Anuales
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
