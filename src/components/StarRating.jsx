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
    // Si tocas la misma estrella que ya está seleccionada, podrías querer resetearla o no.
    // Aquí simplemente actualizamos.
    onRatingChange(newRating);
  };

  return (
    <div
      className={`star-rating-container ${interactive ? "interactive" : ""}`}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        // Lógica para saber cuánto llenar esta estrella específica
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
            {/* ZONAS DE CLIC (Invisibles, están encima de todo) */}
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

            {/* CAPA 1: Estrella Fondo (Gris / Outline) */}
            <Star size={size} className="star-bg" strokeWidth={2} />

            {/* CAPA 2: Estrella Relleno (Color) - Animada */}
            <motion.div
              className="star-fill-mask"
              initial={false}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Star
                size={size}
                className="star-fg"
                strokeWidth={0} // Sin borde para que se vea "relleno suave"
                fill="currentColor"
              />
            </motion.div>
          </div>
        );
      })}

      {/* Texto de puntaje numérico al lado (Opcional, muy útil UX) */}
      {interactive && rating > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
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
