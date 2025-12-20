import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import "./StarRating.css";

const StarRating = ({
  rating,
  onRatingChange,
  interactive = true,
  size = 28,
  activeColor = "#ffdd59", // Color por defecto (Amarillo)
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastClickedStar, setLastClickedStar] = useState(0);

  const handleStarClick = (index, isHalf) => {
    if (!interactive) return;
    const newRating = isHalf ? index - 0.5 : index;
    onRatingChange(newRating);

    setLastClickedStar(Math.ceil(newRating));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div
      className={`star-rating-container ${interactive ? "interactive" : ""}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const currentDisplay = hoverRating || rating;

        let fillPercentage = 0;
        if (currentDisplay >= index) {
          fillPercentage = 100;
        } else if (currentDisplay >= index - 0.5) {
          fillPercentage = 50;
        }

        const shouldExplode = isAnimating && index === lastClickedStar;

        return (
          <motion.div
            key={index}
            className="star-wrapper"
            style={{ width: size, height: size }}
            animate={shouldExplode ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {interactive && (
              <>
                <button
                  type="button"
                  className="click-zone left"
                  onClick={() => handleStarClick(index, true)}
                  onMouseEnter={() => setHoverRating(index - 0.5)}
                />
                <button
                  type="button"
                  className="click-zone right"
                  onClick={() => handleStarClick(index, false)}
                  onMouseEnter={() => setHoverRating(index)}
                />
              </>
            )}

            {/* Estrella Fondo (Borde) */}
            <Star size={size} className="star-bg" strokeWidth={3} />

            {/* Estrella Relleno (Con color dinámico) */}
            <motion.div
              className="star-fill-mask"
              initial={false}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "tween", duration: 0.1 }}
            >
              <Star
                size={size}
                className="star-fg"
                strokeWidth={3}
                style={{ fill: activeColor }} // APLICAMOS EL COLOR AQUÍ
              />
            </motion.div>
          </motion.div>
        );
      })}

      {/* Número al lado (Badge) */}
      {interactive && rating > 0 && (
        <span
          className="rating-number"
          style={{ backgroundColor: activeColor }}
        >
          {rating}
        </span>
      )}
    </div>
  );
};

export default StarRating;
