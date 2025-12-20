import { motion } from "framer-motion";
import { MapPin, DollarSign, Calendar, Pencil, Trash2 } from "lucide-react"; // Importar nuevos iconos
import StarRating from "./StarRating";
import "./ReviewCard.css";

const ReviewCard = ({ review, index, onEdit, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLocationClick = (e) => {
    e.stopPropagation();
    const url = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(
      review.location
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isLegacy = review.ratingFifi === undefined;

  // Manejadores para evitar propagación (que no se active el hover de la card raro)
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(review);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `¿Seguro que querés borrar la reseña de "${review.placeName}"? 🗑️`
      )
    ) {
      onDelete(review.id);
    }
  };

  return (
    <motion.div
      className="review-card"
      initial={{ opacity: 0, y: 20, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        type: "spring",
        stiffness: 120,
      }}
      whileHover={{
        scale: 1.02,
        rotate: 1,
        transition: { duration: 0.2 },
      }}
    >
      <div className="card-top">
        <div className="place-info">
          <h3 className="review-place">{review.placeName}</h3>
          {review.location && (
            <div
              className="location-badge"
              onClick={handleLocationClick}
              title="Ver en Google Maps"
            >
              <MapPin size={14} strokeWidth={3} />
              <span className="location-text">{review.location}</span>
            </div>
          )}
        </div>

        <div className="rating-display-group">
          {isLegacy ? (
            <div className="mini-rating legacy">
              <StarRating
                rating={review.rating}
                interactive={false}
                size={18}
              />
            </div>
          ) : (
            <>
              <div className="mini-rating fifi">
                <span className="mini-label">F:</span>
                <StarRating
                  rating={review.ratingFifi}
                  interactive={false}
                  size={16}
                  activeColor="#ff5e57"
                />
              </div>
              <div className="mini-rating zozo">
                <span className="mini-label">Z:</span>
                <StarRating
                  rating={review.ratingZozo}
                  interactive={false}
                  size={16}
                  activeColor="#0fbcf9"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {review.items && review.items.length > 0 && (
        <div className="items-container">
          {review.items.map((item, idx) => (
            <span key={idx} className="item-pill">
              {item.name}
            </span>
          ))}
        </div>
      )}

      {review.reviewText && (
        <p className="review-text">"{review.reviewText}"</p>
      )}

      <div className="card-footer">
        <div className="meta-group">
          {review.price > 0 && (
            <div className="meta-tag price-tag">
              <DollarSign size={16} strokeWidth={3} />
              <span>{formatPrice(review.price)}</span>
            </div>
          )}
          {review.timestamp && (
            <div className="meta-tag date-tag">
              <Calendar size={16} strokeWidth={3} />
              <span>{formatDate(review.timestamp)}</span>
            </div>
          )}
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="action-buttons">
          <button
            className="action-btn edit-btn"
            onClick={handleEditClick}
            title="Editar"
          >
            <Pencil size={18} strokeWidth={3} />
          </button>
          <button
            className="action-btn delete-btn"
            onClick={handleDeleteClick}
            title="Eliminar"
          >
            <Trash2 size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
