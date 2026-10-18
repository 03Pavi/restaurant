import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/admin/auth-guard";
import { formatItem, DbMenuItem } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await req.json();
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      isVeg = true,
      isAvailable = true,
      prepTimeMins = 20,
    } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: "categoryId, name, and price are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        name: String(name).trim(),
        description: description ? String(description).trim() : null,
        price: Number(price),
        image_url: imageUrl || null,
        is_veg: Boolean(isVeg),
        is_available: Boolean(isAvailable),
        prep_time_mins: Number(prepTimeMins) || 20,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase item insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { item: formatItem(data as DbMenuItem) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}
