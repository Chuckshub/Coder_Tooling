import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { Transaction } from '@/types';

const TRANSACTIONS_COLLECTION = 'transactions';

// Convert Firestore data to Transaction type
const firestoreToTransaction = (id: string, data: any): Transaction => ({
  id,
  vendorId: data.vendorId || undefined,
  merchantName: data.merchantName,
  amount: data.amount,
  date: data.date?.toDate() || new Date(),
  month: data.month,
  description: data.description,
  rampTransactionId: data.rampTransactionId,
  category: data.category,
  cardLastFour: data.cardLastFour,
  employeeName: data.employeeName,
  createdAt: data.createdAt?.toDate() || new Date(),
});

// Convert Transaction to Firestore data
const transactionToFirestore = (transaction: Partial<Transaction>) => {
  const data: any = { ...transaction };
  
  if (transaction.date) {
    data.date = Timestamp.fromDate(transaction.date);
  }
  
  if (transaction.createdAt) {
    data.createdAt = Timestamp.fromDate(transaction.createdAt);
  } else {
    data.createdAt = Timestamp.now();
  }
  
  delete data.id;
  return data;
};

// Get transactions by month
export const getTransactionsByMonth = async (month: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('month', '==', month),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToTransaction(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching transactions by month:', error);
    throw error;
  }
};

// Get transactions by vendor and month
export const getTransactionsByVendorAndMonth = async (
  vendorId: string,
  month: string
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('vendorId', '==', vendorId),
      where('month', '==', month),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToTransaction(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching transactions by vendor and month:', error);
    throw error;
  }
};

// Get unmatched transactions (no vendorId)
export const getUnmatchedTransactions = async (month: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('month', '==', month),
      where('vendorId', '==', null),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToTransaction(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching unmatched transactions:', error);
    throw error;
  }
};

// Create transaction
export const createTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const data = transactionToFirestore(transaction);
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

// Batch create transactions (more efficient for bulk imports)
export const batchCreateTransactions = async (
  transactions: Omit<Transaction, 'id' | 'createdAt'>[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const collectionRef = collection(db, TRANSACTIONS_COLLECTION);
    
    transactions.forEach(transaction => {
      const docRef = doc(collectionRef);
      const data = transactionToFirestore(transaction);
      batch.set(docRef, data);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error batch creating transactions:', error);
    throw error;
  }
};

// Update transaction vendor mapping
export const updateTransactionVendor = async (
  transactionId: string,
  vendorId: string
): Promise<void> => {
  try {
    const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    await updateDoc(docRef, { vendorId });
  } catch (error) {
    console.error('Error updating transaction vendor:', error);
    throw error;
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToTransaction(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }
};

// Check if transaction exists by Ramp ID
export const transactionExistsByRampId = async (rampTransactionId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('rampTransactionId', '==', rampTransactionId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking transaction existence:', error);
    throw error;
  }
};

// Import missing updateDoc
import { updateDoc } from 'firebase/firestore';
