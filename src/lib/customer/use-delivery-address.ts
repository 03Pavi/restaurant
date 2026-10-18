"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface UserAddress {
  id: string;
  label: "Home" | "Work" | "Other" | string;
  receiverName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  deliveryNotes?: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

interface DeliveryAddressState {
  addresses: UserAddress[];
  selectedAddressId: string | null;
  isLoading: boolean;
  setAddresses: (addresses: UserAddress[]) => void;
  setSelectedAddressId: (id: string) => void;
  getSelectedAddress: () => UserAddress | null;
  loadAddressesFromFirestore: (userId: string) => Promise<void>;
  addAddressToFirestore: (userId: string, address: Omit<UserAddress, "id" | "createdAt">) => Promise<UserAddress>;
  updateAddressInFirestore: (userId: string, address: UserAddress) => Promise<void>;
  deleteAddressFromFirestore: (userId: string, addressId: string) => Promise<void>;
}

export const useDeliveryAddressStore = create<DeliveryAddressState>()(
  persist(
    (set, get) => ({
      addresses: [],
      selectedAddressId: null,
      isLoading: false,

      setAddresses: (addresses) => set({ addresses }),

      setSelectedAddressId: (id) => set({ selectedAddressId: id }),

      getSelectedAddress: () => {
        const { addresses, selectedAddressId } = get();
        if (selectedAddressId) {
          const found = addresses.find((a) => a.id === selectedAddressId);
          if (found) return found;
        }
        return addresses.find((a) => a.isDefault) || addresses[0] || null;
      },

      loadAddressesFromFirestore: async (userId: string) => {
        if (!userId) return;
        set({ isLoading: true });

        let loaded: UserAddress[] = [];

        // 1. Try fetching from Supabase API
        try {
          const res = await fetch(`/api/user/addresses?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.addresses) && json.addresses.length > 0) {
              loaded = json.addresses;
            }
          }
        } catch (apiErr) {
          console.warn("Supabase address fetch skipped:", apiErr);
        }

        // 2. Also try Firestore collection if Supabase didn't yield addresses
        if (loaded.length === 0) {
          try {
            const addressesRef = collection(db, "users", userId, "addresses");
            const snapshot = await getDocs(addressesRef);

            snapshot.forEach((d) => {
              loaded.push({ id: d.id, ...d.data() } as UserAddress);
            });
          } catch (fbErr) {
            console.warn("Firestore addresses check skipped:", fbErr);
          }
        }

        // Merge with locally stored addresses if server was empty
        if (loaded.length === 0 && get().addresses.length > 0) {
          loaded = get().addresses;
        }

        loaded.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

        set((state) => ({
          addresses: loaded,
          selectedAddressId:
            state.selectedAddressId && loaded.some((a) => a.id === state.selectedAddressId)
              ? state.selectedAddressId
              : loaded.find((a) => a.isDefault)?.id || loaded[0]?.id || null,
          isLoading: false,
        }));
      },

      addAddressToFirestore: async (userId, addressData) => {
        const newId = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();

        const newAddress: UserAddress = {
          ...addressData,
          id: newId,
          createdAt: now,
        };

        const currentAddresses = get().addresses;
        const updatedList = addressData.isDefault
          ? currentAddresses.map((a) => ({ ...a, isDefault: false }))
          : [...currentAddresses];

        updatedList.push(newAddress);

        set({
          addresses: updatedList,
          selectedAddressId: newId,
        });

        // 1. Save to Supabase API
        try {
          await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...newAddress,
              userId,
            }),
          });
        } catch (apiErr) {
          console.warn("Supabase address save error:", apiErr);
        }

        // 2. Save to Firestore collection
        if (userId) {
          try {
            const addrDocRef = doc(db, "users", userId, "addresses", newId);
            await setDoc(addrDocRef, newAddress);

            if (addressData.isDefault) {
              for (const a of currentAddresses) {
                if (a.isDefault) {
                  await updateDoc(doc(db, "users", userId, "addresses", a.id), {
                    isDefault: false,
                  });
                }
              }
            }
          } catch (err) {
            console.warn("Firestore address save skipped:", err);
          }
        }

        return newAddress;
      },

      updateAddressInFirestore: async (userId, updatedAddress) => {
        const currentList = get().addresses.map((a) => {
          if (a.id === updatedAddress.id) {
            return updatedAddress;
          }
          if (updatedAddress.isDefault && a.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });

        set({ addresses: currentList });

        // 1. Update in Supabase
        try {
          await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...updatedAddress,
              userId,
            }),
          });
        } catch (apiErr) {
          console.warn("Supabase address update error:", apiErr);
        }

        // 2. Update in Firestore
        if (userId) {
          try {
            const addrDocRef = doc(db, "users", userId, "addresses", updatedAddress.id);
            await setDoc(addrDocRef, updatedAddress, { merge: true });

            if (updatedAddress.isDefault) {
              for (const a of get().addresses) {
                if (a.id !== updatedAddress.id && a.isDefault) {
                  await updateDoc(doc(db, "users", userId, "addresses", a.id), {
                    isDefault: false,
                  });
                }
              }
            }
          } catch (err) {
            console.warn("Firestore address update skipped:", err);
          }
        }
      },

      deleteAddressFromFirestore: async (userId, addressId) => {
        const remaining = get().addresses.filter((a) => a.id !== addressId);
        const nextSelected =
          get().selectedAddressId === addressId
            ? remaining[0]?.id || null
            : get().selectedAddressId;

        set({
          addresses: remaining,
          selectedAddressId: nextSelected,
        });

        // 1. Delete in Supabase
        try {
          await fetch(`/api/user/addresses?id=${encodeURIComponent(addressId)}`, {
            method: "DELETE",
          });
        } catch (apiErr) {
          console.warn("Supabase address delete error:", apiErr);
        }

        // 2. Delete in Firestore
        if (userId) {
          try {
            await deleteDoc(doc(db, "users", userId, "addresses", addressId));
          } catch (err) {
            console.warn("Firestore address delete skipped:", err);
          }
        }
      },
    }),
    {
      name: "dinedirect-delivery-address-storage",
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
    }
  )
);
