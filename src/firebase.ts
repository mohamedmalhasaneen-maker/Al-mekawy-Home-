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
import { SavedQuote, CustomerInfo, SavedCustomer } from './types';

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
const CUSTOMERS_COLLECTION = 'customers';

const defaultCustomer: CustomerInfo = {
  name: '',
  phone: '',
  address: '',
  date: new Date().toLocaleDateString('ar-EG'),
  notes: '',
};

/**
 * Save or update a quotation in Firestore Cloud.
 * Automatically persists the customer's name, phone, and address into the customers directory as well.
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

    // Automatically index customer in the customers directory
    if (quote.customer && quote.customer.name && quote.customer.name.trim()) {
      try {
        await saveCustomerToCloud({
          name: quote.customer.name.trim(),
          phone: quote.customer.phone?.trim() || '',
          address: quote.customer.address?.trim() || '',
        });
        console.log(`[Firestore] Automatically indexed customer ${quote.customer.name} from quote ${quote.id}`);
      } catch (custErr) {
        console.warn('[Firestore] Automatic customer index warning:', custErr);
      }
    }
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

/**
 * Save or update a registered customer in Firestore Cloud
 */
export async function saveCustomerToCloud(customer: Partial<SavedCustomer> & { name: string; phone?: string }): Promise<SavedCustomer> {
  try {
    const trimmedName = customer.name.trim();
    const trimmedPhone = (customer.phone || '').trim();
    const cleanDigits = trimmedPhone.replace(/[^0-9]/g, '');
    
    // Normalize clean ID: use existing id, clean phone digits, or name slug + timestamp
    const customerId = customer.id || (
      cleanDigits.length >= 7 
        ? `cust_${cleanDigits}` 
        : `cust_${encodeURIComponent(trimmedName.replace(/\s+/g, '_')).slice(0, 30)}_${Date.now()}`
    );
    const nowIso = new Date().toISOString();

    const customerRecord: SavedCustomer = {
      id: customerId,
      name: trimmedName,
      phone: trimmedPhone,
      address: customer.address?.trim() || '',
      notes: customer.notes?.trim() || '',
      createdAt: customer.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await setDoc(docRef, {
      ...customerRecord,
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[Firestore] Saved customer ${customerId} (${trimmedName}) to cloud`);
    return customerRecord;
  } catch (error) {
    console.error('[Firestore] Error saving customer to cloud:', error);
    throw error;
  }
}

/**
 * Fetch all registered customers from Firestore Cloud
 */
export async function fetchCustomersFromCloud(): Promise<SavedCustomer[]> {
  try {
    const customersQuery = query(collection(db, CUSTOMERS_COLLECTION), orderBy('serverUpdatedAt', 'desc'));
    const snapshot = await getDocs(customersQuery).catch(async () => {
      // Fallback query if serverUpdatedAt index is missing
      return await getDocs(collection(db, CUSTOMERS_COLLECTION));
    });

    const customers: SavedCustomer[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Partial<SavedCustomer>;
      if (data.name && (data.phone || data.id)) {
        customers.push({
          id: data.id || docSnap.id,
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          notes: data.notes || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      }
    });

    return customers;
  } catch (error) {
    console.error('[Firestore] Error fetching customers from cloud:', error);
    return [];
  }
}

/**
 * Delete a registered customer from Firestore Cloud
 */
export async function deleteCustomerFromCloud(customerId: string): Promise<void> {
  try {
    const docRef = doc(db, CUSTOMERS_COLLECTION, customerId);
    await deleteDoc(docRef);
    console.log(`[Firestore] Deleted customer ${customerId} from cloud`);
  } catch (error) {
    console.error('[Firestore] Error deleting customer from cloud:', error);
    throw error;
  }
}

/**
 * Real-time listener for registered customers
 */
export function subscribeToCustomers(onUpdate: (customers: SavedCustomer[]) => void): () => void {
  try {
    const q = collection(db, CUSTOMERS_COLLECTION);
    return onSnapshot(q, (snapshot) => {
      const customers: SavedCustomer[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Partial<SavedCustomer>;
        if (data.name && (data.phone || data.id)) {
          customers.push({
            id: data.id || docSnap.id,
            name: data.name || '',
            phone: data.phone || '',
            address: data.address || '',
            notes: data.notes || '',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });
      // Sort newest updated first
      customers.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      onUpdate(customers);
    }, (err) => {
      console.warn('[Firestore] Customers realtime subscription issue:', err);
    });
  } catch (error) {
    console.warn('[Firestore] Customers subscribe init failed:', error);
    return () => {};
  }
}
