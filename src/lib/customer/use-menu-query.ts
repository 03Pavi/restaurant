import { useQuery } from "@tanstack/react-query";

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMins: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface CustomerMenuResponse {
  categories: MenuCategory[];
}

export function useMenuQuery() {
  return useQuery<CustomerMenuResponse>({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch("/api/menu");
      if (!res.ok) {
        throw new Error("Failed to fetch menu");
      }
      return res.json();
    },
    staleTime: 30_000,
  });
}
