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
  addDoc,
} from "firebase/firestore";
import { db } from "./client";

export type QRCodeType = "TABLE" | "OFFER_SCRATCH";

export interface QRCodeData {
  id: string;
  type: QRCodeType;
  name: string;
  tableNumber?: string;
  location?: string;
  campaignTitle?: string;
  offerCode?: string;
  discountReward?: string;
  description?: string;
  scansToday: number;
  totalScans: number;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

const QR_COLLECTION = "qr_codes";
const SCANS_COLLECTION = "qr_scans";

export async function fetchQRCodes(): Promise<QRCodeData[]> {
  try {
    const colRef = collection(db, QR_COLLECTION);
    const snap = (await Promise.race([
      getDocs(query(colRef, orderBy("name", "asc"))),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 4000)
      ),
    ])) as any;
    return snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        type: data.type || (data.tableNumber ? "TABLE" : "OFFER_SCRATCH"),
        ...data,
      };
    }) as QRCodeData[];
  } catch (err) {
    console.error("Firestore fetchQRCodes error:", err);
    return [];
  }
}

export async function createQRCode(data: {
  type?: QRCodeType;
  name: string;
  tableNumber?: string;
  location?: string;
  campaignTitle?: string;
  offerCode?: string;
  discountReward?: string;
  description?: string;
}): Promise<QRCodeData> {
  const qrType: QRCodeType = data.type || "TABLE";
  const id = qrType === "TABLE" ? `table_${Date.now()}` : `scratch_${Date.now()}`;
  const newQR: QRCodeData = {
    id,
    type: qrType,
    name: data.name.trim(),
    tableNumber: qrType === "TABLE" ? (data.tableNumber?.trim() || "") : undefined,
    location: data.location?.trim() || (qrType === "TABLE" ? "Main Dining" : "Packaging / Counter"),
    campaignTitle: data.campaignTitle?.trim() || (qrType === "OFFER_SCRATCH" ? data.name : undefined),
    offerCode: data.offerCode?.trim().toUpperCase(),
    discountReward: data.discountReward?.trim() || (qrType === "OFFER_SCRATCH" ? "Up to 30% OFF" : undefined),
    description: data.description?.trim(),
    scansToday: 0,
    totalScans: 0,
    isActive: true,
  };

  try {
    const docRef = doc(db, QR_COLLECTION, id);
    await Promise.race([
      setDoc(docRef, {
        ...newQR,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 4000)
      ),
    ]);
  } catch (err) {
    console.error("Firestore createQRCode error:", err);
  }

  return newQR;
}

export async function recordQRScan(
  tableId: string,
  metadata?: { userAgent?: string; ip?: string }
): Promise<void> {
  try {
    // 1. Log scan event in qr_scans collection
    await Promise.race([
      addDoc(collection(db, SCANS_COLLECTION), {
        tableId,
        scannedAt: serverTimestamp(),
        userAgent: metadata?.userAgent || null,
        ip: metadata?.ip || null,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 3000)
      ),
    ]);

    // 2. Increment counters in qr_codes collection document
    const qrDocRef = doc(db, QR_COLLECTION, tableId);
    await Promise.race([
      updateDoc(qrDocRef, {
        scansToday: increment(1),
        totalScans: increment(1),
        updatedAt: serverTimestamp(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database write timeout")), 3000)
      ),
    ]);
  } catch (err) {
    console.error("Firestore recordQRScan error:", err);
  }
}

export async function deleteQRCode(id: string): Promise<void> {
  try {
    const docRef = doc(db, QR_COLLECTION, id);
    await Promise.race([
      deleteDoc(docRef),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database delete timeout")), 3000)
      ),
    ]);
  } catch (err) {
    console.error("Firestore deleteQRCode error:", err);
  }
}
