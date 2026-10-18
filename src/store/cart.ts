import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

export interface CartStoredItem {
  menuItemId: string;
  qty: number;
}

export interface CartStoreState {
  items: CartStoredItem[];
  tableNumber: string | null;
  orderType: OrderType;
  isOpen: boolean;

  // Actions
  addItem: (menuItemId: string) => void;
  removeItem: (menuItemId: string) => void;
  setQty: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
  setTable: (num: string | null) => void;
  setOrderType: (type: OrderType) => void;
  setIsOpen: (open: boolean) => void;
  getTotalCount: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: null,
      orderType: "DINE_IN",
      isOpen: false,

      addItem: (menuItemId: string) => {
        set((state) => {
          const index = state.items.findIndex(
            (item) => item.menuItemId === menuItemId
          );
          if (index !== -1) {
            const next = [...state.items];
            next[index] = {
              ...next[index],
              qty: next[index].qty + 1,
            };
            return { items: next };
          }
          return {
            items: [...state.items, { menuItemId, qty: 1 }],
          };
        });
      },

      removeItem: (menuItemId: string) => {
        set((state) => {
          const index = state.items.findIndex(
            (item) => item.menuItemId === menuItemId
          );
          if (index === -1) return state;

          const current = state.items[index];
          if (current.qty > 1) {
            const next = [...state.items];
            next[index] = { ...current, qty: current.qty - 1 };
            return { items: next };
          }
          return {
            items: state.items.filter((item) => item.menuItemId !== menuItemId),
          };
        });
      },

      setQty: (menuItemId: string, qty: number) => {
        set((state) => {
          if (qty <= 0) {
            return {
              items: state.items.filter((item) => item.menuItemId !== menuItemId),
            };
          }
          const index = state.items.findIndex(
            (item) => item.menuItemId === menuItemId
          );
          if (index !== -1) {
            const next = [...state.items];
            next[index] = { menuItemId, qty };
            return { items: next };
          }
          return {
            items: [...state.items, { menuItemId, qty }],
          };
        });
      },

      clearCart: () => set({ items: [] }),

      setTable: (tableNumber: string | null) => set({ tableNumber }),

      setOrderType: (orderType: OrderType) => set({ orderType }),

      setIsOpen: (isOpen: boolean) => set({ isOpen }),

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
      },
    }),
    {
      name: "dinedirect-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
        orderType: state.orderType,
      }),
    }
  )
);
