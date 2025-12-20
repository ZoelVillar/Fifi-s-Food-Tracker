import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PopSelect from "./PopSelect";
import {
  Plus,
  X,
  Save,
  DollarSign,
  Store,
  Utensils,
  MessageSquare,
  RotateCcw, // Icono para cancelar
  Pencil, // Icono para indicar edición
} from "lucide-react";
import StarRating from "./StarRating";
import { CATEGORIES } from "../constants/categories";
import { addReview, updateReview } from "../services/firestoreService";
import "./ReviewForm.css";
import GoogleLocationSearch from "./GoogleLocationSearch";

const ReviewForm = ({ onSaveSuccess, editingReview, onCancelEdit }) => {
  // Estado inicial vacío
  const initialFormState = {
    placeName: "",
    location: "",
    price: "",
    ratingFifi: 0,
    ratingZozo: 0,
    reviewText: "",
    items: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "" });

  // Cuando recibimos una review para editar, llenamos el formulario
  useEffect(() => {
    if (editingReview) {
      setFormData({
        placeName: editingReview.placeName || "",
        location: editingReview.location || "",
        price: editingReview.price || "",
        // Compatibilidad con ratings viejos
        ratingFifi: editingReview.ratingFifi || editingReview.rating || 0,
        ratingZozo: editingReview.ratingZozo || editingReview.rating || 0,
        reviewText: editingReview.reviewText || "",
        items: editingReview.items || [],
      });
      // Scroll suave hacia el formulario
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setFormData(initialFormState);
    }
  }, [editingReview]);

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
    if (
      !formData.placeName ||
      formData.ratingFifi === 0 ||
      formData.ratingZozo === 0
    ) {
      alert("¡Ojo! Faltan datos (Lugar o Votos).");
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        placeName: formData.placeName.trim(),
        location: formData.location.trim(),
        price: parseFloat(formData.price) || 0,
        ratingFifi: formData.ratingFifi,
        ratingZozo: formData.ratingZozo,
        reviewText: formData.reviewText.trim(),
        items: formData.items,
      };

      if (editingReview) {
        // Modo edición
        await updateReview(editingReview.id, dataToSave);
      } else {
        // Modo creación
        await addReview({
          ...dataToSave,
          timestamp: new Date(), // Solo agregamos fecha si es nuevo
        });
      }

      setFormData(initialFormState);
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
      className={`form-container ${editingReview ? "editing-mode" : ""}`}
    >
      {/* Indicador visual de edición */}
      {editingReview && (
        <div className="editing-banner">
          <Pencil size={16} />
          <span>Editando: {editingReview.placeName}</span>
          <button type="button" onClick={onCancelEdit} className="cancel-x">
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="review-form">
        {/* Grid de inputs */}
        <div className="form-grid">
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

          <div className="input-group">
            <label>Ubicación</label>
            <GoogleLocationSearch
              value={formData.location}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, location: val }))
              }
            />
          </div>

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

        {/* Sección de items */}
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
              <Utensils
                className="input-icon"
                size={18}
                strokeWidth={3}
                style={{ zIndex: 0 }}
              />
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Plato..."
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
              <Plus size={24} strokeWidth={4} />
            </button>
          </div>
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
                    <X size={16} strokeWidth={3} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sección de ratings */}
        <div className="rating-section">
          <label
            className="section-label centered"
            style={{ color: "#1a1a1a", textShadow: "none" }}
          >
            DOBLE VEREDICTO
          </label>
          <div className="dual-rating-container">
            <div className="rating-column">
              <span className="rating-label-text">Fifi</span>
              <div className="rating-pill fifi-theme">
                <StarRating
                  rating={formData.ratingFifi}
                  onRatingChange={(r) =>
                    setFormData((prev) => ({ ...prev, ratingFifi: r }))
                  }
                  interactive={true}
                  size={32}
                  activeColor="#ff5e57"
                />
              </div>
            </div>
            <div className="rating-column">
              <span className="rating-label-text">Zozo</span>
              <div className="rating-pill zozo-theme">
                <StarRating
                  rating={formData.ratingZozo}
                  onRatingChange={(r) =>
                    setFormData((prev) => ({ ...prev, ratingZozo: r }))
                  }
                  interactive={true}
                  size={32}
                  activeColor="#0fbcf9"
                />
              </div>
            </div>
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
              placeholder="Comentarios..."
              rows="3"
              className="modern-textarea"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          {editingReview && (
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancelEdit}
              disabled={loading}
            >
              <RotateCcw size={20} strokeWidth={3} />
              Cancelar
            </button>
          )}

          <motion.button
            type="submit"
            className={`submit-btn-large ${editingReview ? "is-editing" : ""}`}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              "Procesando..."
            ) : editingReview ? (
              <>
                <Save size={24} strokeWidth={3} />
                <span>Actualizar Reseña</span>
              </>
            ) : (
              <>
                <Save size={24} strokeWidth={3} />
                <span>Guardar Reseña</span>
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
