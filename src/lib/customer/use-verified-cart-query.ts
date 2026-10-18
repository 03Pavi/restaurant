import { useQuery } from "@tanstack/react-query";
import { useCartItems } from "@/lib/customer/use-cart";
import { VerifiedLineItem } from "@/app/api/cart/verify/route";

export type { VerifiedLineItem };

export interface VerifiedCartResponse {
  lineItems: VerifiedLineItem[];
  subtotal: number;
  hasUnavailableItems: boolean;
}

export function useVerifiedCartQuery() {
  const items = useCartItems();
  const itemsHash = JSON.stringify(items);

  return useQuery<VerifiedCartResponse>({
    queryKey: ["cart-verify", itemsHash],
    queryFn: async () => {
      if (!items || items.length === 0) {
        return { lineItems: [], subtotal: 0, hasUnavailableItems: false };
      }

      const res = await fetch("/api/cart/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify cart");
      }

      return res.json();
    },
    staleTime: 5_000,
  });
}
