// Customer-only API calls and queries

export interface CustomerMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMins: number;
  imageUrl?: string | null;
  categoryId: string;
}

export interface CustomerMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: CustomerMenuItem[];
}

export async function fetchCustomerMenu(): Promise<CustomerMenuCategory[]> {
  const res = await fetch("/api/menu");
  if (!res.ok) {
    throw new Error("Failed to fetch menu");
  }
  const data = await res.json();
  return data.categories || [];
}
