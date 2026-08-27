import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SavedQuote, CustomerInfo } from './types';

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the designated database ID if provided, otherwise default
export const db = getFirestore(
  app, 
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId 
    : undefined
);

const QUOTES_COLLECTION = 'quotes';

const defaultCustomer: CustomerInfo = {
  name: '',
  phone: '',
  address: '',
  date: new Date().toLocaleDateString('ar-EG'),
  notes: '',
};

/**
 * Save or update a quotation in Firestore Cloud
 */
export async function saveQuoteToCloud(quote: SavedQuote): Promise<void> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, quote.id);
    await setDoc(docRef, {
      ...quote,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[Firestore] Saved quote ${quote.id} to cloud successfully`);
  } catch (error) {
    console.error('[Firestore] Error saving quote to cloud:', error);
    throw error;
  }
}

/**
 * Fetch all saved quotations from Firestore Cloud
 */
export async function fetchQuotesFromCloud(): Promise<SavedQuote[]> {
  try {
    const quotesQuery = query(collection(db, QUOTES_COLLECTION), orderBy('serverUpdatedAt', 'desc'));
    const snapshot = await getDocs(quotesQuery).catch(async () => {
      // Fallback query if serverUpdatedAt index isn't ready
      return await getDocs(collection(db, QUOTES_COLLECTION));
    });

    const quotes: SavedQuote[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Partial<SavedQuote>;
      const customerData: CustomerInfo = {
        ...defaultCustomer,
        ...(data.customer || {}),
        date: data.customer?.date || data.date || new Date().toLocaleDateString('ar-EG'),
      };

      quotes.push({
        id: data.id || docSnap.id,
        name: data.name || 'عرض سعر بدون اسم',
        customer: customerData,
        items: Array.isArray(data.items) ? data.items : [],
        totalPrice: Number(data.totalPrice) || 0,
        date: data.date || new Date().toLocaleDateString('ar-EG'),
      });
    });

    return quotes;
  } catch (error) {
    console.error('[Firestore] Error fetching quotes from cloud:', error);
    return [];
  }
}

/**
 * Delete a quotation from Firestore Cloud
 */
export async function deleteQuoteFromCloud(quoteId: string): Promise<void> {
  try {
    const docRef = doc(db, QUOTES_COLLECTION, quoteId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted quote ${quoteId} from cloud`);
  } catch (error) {
    console.error('[Firestore] Error deleting quote from cloud:', error);
    throw error;
  }
}

/**
 * Real-time listener for quotes
 */
export function subscribeToQuotes(onUpdate: (quotes: SavedQuote[]) => void): () => void {
  try {
    const q = collection(db, QUOTES_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const quotes: SavedQuote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Partial<SavedQuote>;
        const customerData: CustomerInfo = {
          ...defaultCustomer,
          ...(data.customer || {}),
          date: data.customer?.date || data.date || new Date().toLocaleDateString('ar-EG'),
        };

        quotes.push({
          id: data.id || docSnap.id,
          name: data.name || 'عرض سعر بدون اسم',
          customer: customerData,
          items: Array.isArray(data.items) ? data.items : [],
          totalPrice: Number(data.totalPrice) || 0,
          date: data.date || new Date().toLocaleDateString('ar-EG'),
        });
      });
      onUpdate(quotes);
    }, (err) => {
      console.warn('[Firestore] Realtime subscription issue:', err);
    });
  } catch (error) {
    console.warn('[Firestore] Subscribe init failed:', error);
    return () => {};
  }
}
