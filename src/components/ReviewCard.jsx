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

  const handleLocationClick = (e) => {
    e.stopPropagation();
    const url = `http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(
      review.location
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Determinar si es legacy (solo rating) o nuevo (ratingFifi + ratingZozo)
  const isLegacy = review.ratingFifi === undefined;

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

        {/* Sección de Ratings */}
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
