import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Save,
  MapPin,
  DollarSign,
  Store,
  Utensils,
  MessageSquare,
} from "lucide-react";
import StarRating from "./StarRating";
import { CATEGORIES } from "../constants/categories";
import { addReview } from "../services/firestoreService";
import "./ReviewForm.css";

const ReviewForm = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    placeName: "",
    location: "",
    price: "",
    rating: 0,
    reviewText: "",
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "" });

  // Manejadores de estado (sin cambios en la lógica, solo en UI)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category) {
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, { ...newItem }],
      }));
      setNewItem({ name: "", category: "" });
    }
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.placeName || formData.rating === 0) {
      // Usamos un modal o toast en una app real, aquí un alert limpio
      alert("Por favor completa el nombre y el puntaje.");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        placeName: formData.placeName.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price) || 0,
        rating: formData.rating,
        reviewText: formData.reviewText.trim(),
        items: formData.items,
        timestamp: new Date(),
      };

      await addReview(reviewData);

      setFormData({
        placeName: "",
        location: "",
        price: "",
        rating: 0,
        reviewText: "",
        items: [],
      });

      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="form-container"
    >
      <form onSubmit={handleSubmit} className="review-form">
        {/* --- SECCIÓN PRINCIPAL --- */}
        <div className="form-grid">
          {/* Nombre del Lugar */}
          <div className="input-group full-width">
            <label>Lugar</label>
            <div className="input-wrapper">
              <Store className="input-icon" size={18} />
              <input
                type="text"
                name="placeName"
                value={formData.placeName}
                onChange={handleInputChange}
                placeholder="¿Dónde comieron hoy?"
                required
                className="modern-input"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="input-group">
            <label>Ubicación</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={18} />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Palermo"
                className="modern-input"
              />
            </div>
          </div>

          {/* Precio */}
          <div className="input-group">
            <label>Precio Total</label>
            <div className="input-wrapper">
              <DollarSign className="input-icon" size={18} />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="modern-input"
              />
            </div>
          </div>
        </div>

        {/* --- SECCIÓN COMIDA (ITEMS) --- */}
        <div className="form-section items-section">
          <label className="section-label">¿Qué pidieron?</label>

          <div className="add-item-box">
            <div className="select-wrapper">
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, category: e.target.value }))
                }
                className="modern-select"
              >
                <option value="">Categoría...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-wrapper item-input-wrapper">
              <Utensils className="input-icon" size={16} />
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Plato (ej: Doble Cheddar)"
                className="modern-input"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddItem())
                }
              />
            </div>

            <button
              type="button"
              className="add-btn"
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.category}
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Lista de Items Agregados (Pills) */}
          <div className="items-list">
            <AnimatePresence>
              {formData.items.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="item-chip"
                >
                  <span className="chip-cat">{item.category}</span>
                  <span className="chip-name">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="chip-remove"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- SECCIÓN PUNTAJE Y RESEÑA --- */}
        <div className="form-section rating-section">
          <label className="section-label centered">Tu Veredicto</label>
          <div className="rating-container">
            <StarRating
              rating={formData.rating}
              onRatingChange={(r) =>
                setFormData((prev) => ({ ...prev, rating: r }))
              }
              interactive={true}
              size={32} // Estrellas más grandes
            />
          </div>
        </div>

        <div className="input-group">
          <div className="input-wrapper textarea-wrapper">
            <MessageSquare className="input-icon text-icon" size={18} />
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleInputChange}
              placeholder="Escribe aquí tu reseña..."
              rows="3"
              className="modern-textarea"
            />
          </div>
        </div>

        {/* --- BOTÓN SUBMIT --- */}
        <motion.button
          type="submit"
          className="submit-btn-large"
          disabled={loading}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(255, 107, 107, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save size={20} />
              <span>Guardar Reseña</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
