import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PopSelect from "./PopSelect";
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
      alert("¡Oye! Falta el nombre del lugar o el puntaje.");
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
      alert("Ups, error al guardar.");
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
              <Store className="input-icon" size={20} strokeWidth={3} />
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
              <MapPin className="input-icon" size={20} strokeWidth={3} />
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
              <DollarSign className="input-icon" size={20} strokeWidth={3} />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="modern-input"
              />
            </div>
          </div>
        </div>
        {/* --- SECCIÓN COMIDA (ITEMS) --- */}
        <div className="items-section">
          <label className="section-label">¿QUÉ PIDIERON?</label>

          <div className="add-item-box">
            <div className="select-wrapper">
              <PopSelect
                options={CATEGORIES}
                value={newItem.category}
                onChange={(val) =>
                  setNewItem((prev) => ({ ...prev, category: val }))
                }
                placeholder="Categoría..."
              />
            </div>
            <div className="input-wrapper item-input-wrapper">
              <Utensils className="input-icon" size={18} strokeWidth={3} />
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
              title="Agregar Item"
            >
              <Plus size={24} strokeWidth={4} />
            </button>
          </div>

          {/* Lista de Items Agregados (Pills) */}
          <div className="items-list">
            <AnimatePresence>
              {formData.items.map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
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
                    <X size={16} strokeWidth={3} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {/* --- SECCIÓN PUNTAJE Y RESEÑA --- */}
        <div className="rating-section">
          <label
            className="section-label centered"
            style={{ color: "#1a1a1a", textShadow: "none" }}
          >
            TU VEREDICTO
          </label>
          <div className="rating-container">
            <StarRating
              rating={formData.rating}
              onRatingChange={(r) =>
                setFormData((prev) => ({ ...prev, rating: r }))
              }
              interactive={true}
              size={36}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-wrapper textarea-wrapper">
            <MessageSquare
              className="input-icon text-icon"
              size={20}
              strokeWidth={3}
            />
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
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save size={24} strokeWidth={3} />
              <span>Guardar Reseña</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
