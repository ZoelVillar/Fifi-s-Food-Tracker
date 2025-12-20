import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from '../config/firebase';
const COLLECTION_NAME = "reviews";

// Guardar reseña con Doble Rating
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reviewData,
      // Aseguramos timestamp correcto
      timestamp: reviewData.timestamp instanceof Date
        ? Timestamp.fromDate(reviewData.timestamp)
        : reviewData.timestamp,
      // Nos aseguramos que los ratings sean numéricos
      ratingFifi: parseFloat(reviewData.ratingFifi) || 0,
      ratingZozo: parseFloat(reviewData.ratingZozo) || 0,
      // Guardamos un promedio calculado para facilitar consultas simples o legacy
      rating: (parseFloat(reviewData.ratingFifi) + parseFloat(reviewData.ratingZozo)) / 2
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Obtener recientes (Home)
export const getRecentReviews = async (limitCount = 5) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting recent reviews:", error);
    throw error;
  }
};

// Obtener todas (Stats)
export const getAllReviews = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting all reviews:", error);
    throw error;
  }
};

export const updateReview = async (id, updatedData) => {
  try {
    const reviewRef = doc(db, COLLECTION_NAME, id);

    // Recalculamos el promedio para mantener consistencia
    const ratingFifi = parseFloat(updatedData.ratingFifi) || 0;
    const ratingZozo = parseFloat(updatedData.ratingZozo) || 0;
    const avgRating = (ratingFifi + ratingZozo) / 2;

    await updateDoc(reviewRef, {
      ...updatedData,
      ratingFifi,
      ratingZozo,
      rating: avgRating,
      // No tocamos el timestamp original para que no salte al inicio del feed
    });
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Eliminar reseña
export const deleteReview = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
