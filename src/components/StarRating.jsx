import { motion } from "framer-motion";
import { Star } from "lucide-react";
import "./StarRating.css";

const StarRating = ({
  rating,
  onRatingChange,
  interactive = true,
  size = 24,
}) => {
  const handleStarClick = (value, isHalf) => {
    if (!interactive) return;
    const newRating = isHalf ? value - 0.5 : value;
    onRatingChange(newRating);
  };

  return (
    <div
      className={`star-rating-container ${interactive ? "interactive" : ""}`}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        let fillPercentage = 0;
        if (rating >= index) {
          fillPercentage = 100;
        } else if (rating >= index - 0.5) {
          fillPercentage = 50;
        }

        return (
          <div
            key={index}
            className="star-wrapper"
            style={{ width: size, height: size }}
          >
            {/* ZONAS DE CLIC */}
            {interactive && (
              <>
                <button
                  type="button"
                  className="click-zone left"
                  onClick={() => handleStarClick(index, true)}
                  aria-label={`Calificar ${index - 0.5}`}
                />
                <button
                  type="button"
                  className="click-zone right"
                  onClick={() => handleStarClick(index, false)}
                  aria-label={`Calificar ${index}`}
                />
              </>
            )}

            {/* CAPA 1: Estrella Fondo (Blanca con borde negro) */}
            {/* strokeWidth={3} para el estilo Pop grueso */}
            <Star size={size} className="star-bg" strokeWidth={3} />

            {/* CAPA 2: Estrella Relleno (Amarilla con borde negro) */}
            <motion.div
              className="star-fill-mask"
              initial={false}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Star size={size} className="star-fg" strokeWidth={3} />
            </motion.div>
          </div>
        );
      })}

      {/* Badge con el número */}
      {interactive && rating > 0 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          key={rating}
          className="rating-number"
        >
          {rating}
        </motion.span>
      )}
    </div>
  );
};

export default StarRating;
