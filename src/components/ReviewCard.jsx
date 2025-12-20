import { motion } from "framer-motion";
import { MapPin, DollarSign, Calendar } from "lucide-react";
import StarRating from "./StarRating";
import "./ReviewCard.css";

const ReviewCard = ({ review, index }) => {
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

  // Función para abrir en Google Maps
  const handleLocationClick = (e) => {
    e.stopPropagation(); // Evita que el click dispare otros eventos de la card
    // Esta URL anda en web y abre la app nativa en móviles
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      review.location
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
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

          {/* Ubicación clickeable */}
          {review.location && (
            <div
              className="location-badge"
              onClick={handleLocationClick}
              style={{ cursor: "pointer", transition: "transform 0.1s" }}
              title="Ver en Google Maps"
            >
              <MapPin size={14} strokeWidth={3} />
              <span
                style={{
                  textDecoration: "underline",
                  textDecorationThickness: "2px",
                }}
              >
                {review.location}
              </span>
            </div>
          )}
        </div>

        <div className="rating-wrapper">
          <StarRating rating={review.rating} interactive={false} size={20} />
        </div>
      </div>

      {/* ... El resto del componente (Items, Texto, Footer) igual ... */}

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
