import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./client";

export interface OfferData {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  timesRedeemed: number;
  totalSaved: number;
  description: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const OFFERS_COLLECTION = "offers";

export async function fetchOffers(): Promise<OfferData[]> {
  try {
    const colRef = collection(db, OFFERS_COLLECTION);
    const snap = (await Promise.race([
      getDocs(query(colRef, orderBy("code", "asc"))),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 4000)
      ),
    ])) as any;
    return snap.docs.map((d: any) => ({
      id: d.id,
      ...d.data(),
    })) as OfferData[];
  } catch (err) {
    console.error("Firestore fetchOffers error:", err);
    return [];
  }
}

export async function createOffer(data: {
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  description?: string;
}): Promise<OfferData> {
  const id = `offer_${Date.now()}`;
  const newOffer: OfferData = {
    id,
    code: data.code.trim().toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountValue,
    minOrderValue: data.minOrderValue || 0,
    maxDiscount: data.maxDiscount,
    expiryDate: data.expiryDate,
    isActive: true,
    timesRedeemed: 0,
    totalSaved: 0,
    description: data.description?.trim() || `${data.discountValue}${data.discountType === "PERCENT" ? "%" : "₹"} promotional deal`,
  };

  try {
    const offerRef = doc(db, OFFERS_COLLECTION, id);
    await Promise.race([
      setDoc(offerRef, {
        ...newOffer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 4000)
      ),
    ]);
  } catch (err) {
    console.warn("Firestore createOffer error:", err);
  }

  return newOffer;
}

export async function updateOfferStatus(id: string, isActive: boolean): Promise<void> {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, id);
    await Promise.race([
      updateDoc(offerRef, {
        isActive,
        updatedAt: serverTimestamp(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 3000)
      ),
    ]);
  } catch (err) {
    console.warn("Firestore updateOfferStatus error:", err);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, id);
    await Promise.race([
      deleteDoc(offerRef),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database delete timeout")), 3000)
      ),
    ]);
  } catch (err) {
    console.warn("Firestore deleteOffer error:", err);
  }
}

export async function recordOfferRedemption(id: string, savedAmount: number): Promise<void> {
  try {
    const offerRef = doc(db, OFFERS_COLLECTION, id);
    await Promise.race([
      updateDoc(offerRef, {
        timesRedeemed: increment(1),
        totalSaved: increment(savedAmount),
        updatedAt: serverTimestamp(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 3000)
      ),
    ]);
  } catch (err) {
    console.warn("Firestore recordOfferRedemption error:", err);
  }
}
