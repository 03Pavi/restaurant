import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { verifyAdminAuth } from "@/lib/admin/auth-guard";
import { formatCategory, DbMenuCategory } from "@/lib/supabase/types";

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await req.json();
    const { name, sortOrder } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        name: name.trim(),
        sort_order: typeof sortOrder === "number" ? sortOrder : 0,
      })
      .select("*, items:menu_items(*)")
      .single();

    if (error) {
      console.error("Supabase category insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { category: formatCategory(data as DbMenuCategory) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create menu category:", error);
    return NextResponse.json(
      { error: "Failed to create menu category" },
      { status: 500 }
    );
  }
}
