import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Vendor } from '@/types';

const VENDORS_COLLECTION = 'vendors';

// Convert Firestore data to Vendor type
const firestoreToVendor = (id: string, data: any): Vendor => ({
  id,
  name: data.name,
  monthlyBudget: data.monthlyBudget,
  category: data.category,
  active: data.active ?? true,
  alternativeNames: data.alternativeNames || [],
  notes: data.notes,
  createdAt: data.createdAt?.toDate() || new Date(),
  updatedAt: data.updatedAt?.toDate() || new Date(),
});

// Convert Vendor to Firestore data
const vendorToFirestore = (vendor: Partial<Vendor>) => {
  const data: any = {
    ...vendor,
    updatedAt: Timestamp.now(),
  };
  
  if (vendor.createdAt) {
    data.createdAt = Timestamp.fromDate(vendor.createdAt);
  }
  
  delete data.id;
  return data;
};

// Get all vendors
export const getAllVendors = async (activeOnly: boolean = false): Promise<Vendor[]> => {
  try {
    const vendorsRef = collection(db, VENDORS_COLLECTION);
    let q = query(vendorsRef, orderBy('name'));
    
    if (activeOnly) {
      q = query(vendorsRef, where('active', '==', true), orderBy('name'));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToVendor(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

// Get vendor by ID
export const getVendorById = async (id: string): Promise<Vendor | null> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return firestoreToVendor(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

// Create new vendor
export const createVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const data = {
      ...vendorToFirestore(vendor),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, VENDORS_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

// Update vendor
export const updateVendor = async (id: string, updates: Partial<Vendor>): Promise<void> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, id);
    const data = vendorToFirestore(updates);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};

// Delete vendor (soft delete by marking inactive)
export const deleteVendor = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, id);
    await updateDoc(docRef, {
      active: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    throw error;
  }
};

// Hard delete vendor (use with caution)
export const hardDeleteVendor = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, VENDORS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error hard deleting vendor:', error);
    throw error;
  }
};

// Get vendors by category
export const getVendorsByCategory = async (category: string): Promise<Vendor[]> => {
  try {
    const q = query(
      collection(db, VENDORS_COLLECTION),
      where('category', '==', category),
      where('active', '==', true),
      orderBy('name')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToVendor(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    throw error;
  }
};

// Search vendors by name (client-side filtering for simplicity)
export const searchVendors = async (searchTerm: string): Promise<Vendor[]> => {
  try {
    const vendors = await getAllVendors(true);
    const lowerSearch = searchTerm.toLowerCase();
    
    return vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(lowerSearch) ||
      vendor.alternativeNames.some(alt => alt.toLowerCase().includes(lowerSearch))
    );
  } catch (error) {
    console.error('Error searching vendors:', error);
    throw error;
  }
};
