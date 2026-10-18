export interface DbMenuCategory {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
  items?: DbMenuItem[];
}

export interface DbMenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  prep_time_mins: number;
  created_at?: string;
}

export interface FormattedMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  prepTimeMins: number;
}

export interface FormattedMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: FormattedMenuItem[];
}

export function formatCategory(cat: DbMenuCategory): FormattedMenuCategory {
  return {
    id: String(cat.id),
    name: cat.name,
    sortOrder: cat.sort_order ?? 0,
    items: (cat.items || []).map(formatItem),
  };
}

export function formatItem(item: DbMenuItem): FormattedMenuItem {
  return {
    id: String(item.id),
    categoryId: String(item.category_id),
    name: item.name,
    description: item.description || "",
    price: Number(item.price) || 0,
    imageUrl: item.image_url || null,
    isVeg: Boolean(item.is_veg),
    isAvailable: Boolean(item.is_available),
    prepTimeMins: Number(item.prep_time_mins) || 20,
  };
}
