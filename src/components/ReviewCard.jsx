import { motion } from "framer-motion";
import { MapPin, DollarSign, Calendar } from "lucide-react";
import StarRating from "./StarRating";
import "./ReviewCard.css";

const ReviewCard = ({ review, index }) => {
  // Formateador de fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short",
    }).format(date); // Ej: 14 dic.
  };

  // Formateador de precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      className="review-card"
      initial={{ opacity: 0, y: 20, rotate: -1 }} // Empieza un poco chueca
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
      {/* Header de la Card: Título y Estrellas */}
      <div className="card-top">
        <div className="place-info">
          <h3 className="review-place">{review.placeName}</h3>
          {review.location && (
            <div className="location-badge">
              <MapPin size={14} strokeWidth={3} />
              <span>{review.location}</span>
            </div>
          )}
        </div>
        {/* Rating wrapper ahora maneja el layout de las estrellas */}
        <div className="rating-wrapper">
          <StarRating rating={review.rating} interactive={false} size={20} />
        </div>
      </div>

      {/* Cuerpo: Items pedidos (Pills estilo sticker) */}
      {review.items && review.items.length > 0 && (
        <div className="items-container">
          {review.items.map((item, idx) => (
            <span key={idx} className="item-pill">
              {item.name}
            </span>
          ))}
        </div>
      )}

      {/* Texto de la reseña */}
      {review.reviewText && (
        <p className="review-text">"{review.reviewText}"</p>
      )}

      {/* Footer: Metadatos (Precio y Fecha) */}
      <div className="card-footer">
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
    </motion.div>
  );
};

export default ReviewCard;
