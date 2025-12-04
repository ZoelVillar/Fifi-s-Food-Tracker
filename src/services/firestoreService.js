import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'reviews';

// Guardar una nueva reseña
export const addReview = async (reviewData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...reviewData,
      timestamp: Timestamp.fromDate(reviewData.timestamp)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

// Obtener las últimas N reseñas
export const getRecentReviews = async (count = 5) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
};

// Obtener todas las reseñas
export const getAllReviews = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all reviews:', error);
    throw error;
  }
};

// Obtener reseñas de un mes específico
export const getReviewsByMonth = async (year, month) => {
  try {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting reviews by month:', error);
    throw error;
  }
};

