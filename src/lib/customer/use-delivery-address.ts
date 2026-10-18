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
        try {
          const addressesRef = collection(db, "users", userId, "addresses");
          const snapshot = await getDocs(addressesRef);
          const loaded: UserAddress[] = [];

          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...d.data() } as UserAddress);
          });

          // Sort default first, then by date
          loaded.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

          set((state) => ({
            addresses: loaded,
            selectedAddressId:
              state.selectedAddressId && loaded.some((a) => a.id === state.selectedAddressId)
                ? state.selectedAddressId
                : loaded.find((a) => a.isDefault)?.id || loaded[0]?.id || null,
            isLoading: false,
          }));
        } catch (err) {
          console.error("Failed to load addresses from Firestore:", err);
          set({ isLoading: false });
        }
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

        if (userId) {
          try {
            const addrDocRef = doc(db, "users", userId, "addresses", newId);
            await setDoc(addrDocRef, newAddress);

            // If marked default, update other documents
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
            console.error("Error saving address to Firestore:", err);
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
            console.error("Error updating address in Firestore:", err);
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

        if (userId) {
          try {
            await deleteDoc(doc(db, "users", userId, "addresses", addressId));
          } catch (err) {
            console.error("Error deleting address from Firestore:", err);
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
