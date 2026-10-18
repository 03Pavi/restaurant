import { useCartStore, CartStoredItem, OrderType } from "@/store/cart";

export type { CartStoredItem, OrderType };

export function useCartItems(): CartStoredItem[] {
  return useCartStore((state) => state.items);
}

export function useCartItemQty(menuItemId: string): number {
  return useCartStore((state) => {
    const item = state.items.find((i) => i.menuItemId === menuItemId);
    return item ? item.qty : 0;
  });
}

export function useAddToCart() {
  return useCartStore((state) => state.addItem);
}

export function useRemoveFromCart() {
  return useCartStore((state) => state.removeItem);
}

export function useSetCartQty() {
  return useCartStore((state) => state.setQty);
}

export function useClearCart() {
  return useCartStore((state) => state.clearCart);
}

export function useCartTable(): [string | null, (table: string | null) => void] {
  const table = useCartStore((state) => state.tableNumber);
  const setTable = useCartStore((state) => state.setTable);
  return [table, setTable];
}

export function useCartOrderType(): [OrderType, (type: OrderType) => void] {
  const orderType = useCartStore((state) => state.orderType);
  const setOrderType = useCartStore((state) => state.setOrderType);
  return [orderType, setOrderType];
}

export function useCartTotalCount(): number {
  return useCartStore((state) => state.getTotalCount());
}

export function useCartDrawerOpen(): [boolean, (open: boolean) => void] {
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  return [isOpen, setIsOpen];
}
