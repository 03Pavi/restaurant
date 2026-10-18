import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AdminMenuItem {
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

export interface AdminMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: AdminMenuItem[];
}

export interface SaveItemInput {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable?: boolean;
  prepTimeMins?: number;
}

export interface SaveCategoryInput {
  name: string;
  sortOrder?: number;
}

export function useAdminMenuQuery() {
  return useQuery<{ categories: AdminMenuCategory[] }>({
    queryKey: ["admin-menu"],
    queryFn: async () => {
      const res = await fetch("/api/admin/menu");
      if (!res.ok) {
        throw new Error("Failed to load admin menu");
      }
      return res.json();
    },
    staleTime: 10_000,
  });
}

export function useToggleAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable?: boolean }) => {
      const res = await fetch(`/api/admin/menu/item/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      });
      if (!res.ok) {
        throw new Error("Failed to update item availability");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
    },
  });
}

export function useSaveItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveItemInput) => {
      const isEdit = Boolean(input.id);
      const url = isEdit ? `/api/admin/menu/item/${input.id}` : "/api/admin/menu/item";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error(isEdit ? "Failed to update dish" : "Failed to create dish");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
    },
  });
}

export function useSaveCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveCategoryInput) => {
      const res = await fetch("/api/admin/menu/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error("Failed to create category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu"] });
    },
  });
}
