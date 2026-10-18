import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/admin/auth-guard";
import { formatItem, DbMenuItem } from "@/lib/supabase/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      price,
      imageUrl,
      isVeg,
      isAvailable,
      prepTimeMins,
      categoryId,
    } = body;

    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = String(name).trim();
    if (description !== undefined) updatePayload.description = description ? String(description).trim() : null;
    if (price !== undefined) updatePayload.price = Number(price);
    if (imageUrl !== undefined) updatePayload.image_url = imageUrl || null;
    if (isVeg !== undefined) updatePayload.is_veg = Boolean(isVeg);
    if (isAvailable !== undefined) updatePayload.is_available = Boolean(isAvailable);
    if (prepTimeMins !== undefined) updatePayload.prep_time_mins = Number(prepTimeMins);
    if (categoryId !== undefined) updatePayload.category_id = categoryId;

    const { data, error } = await supabase
      .from("menu_items")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase item update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ item: formatItem(data as DbMenuItem) });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}
