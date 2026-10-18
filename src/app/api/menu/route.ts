import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { formatCategory, DbMenuCategory } from "@/lib/supabase/types";

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from("menu_categories")
      .select("*, items:menu_items(*)")
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ categories: [] });
    }

    const formatted = ((categories as DbMenuCategory[]) || []).map(formatCategory);
    return NextResponse.json({ categories: formatted });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
