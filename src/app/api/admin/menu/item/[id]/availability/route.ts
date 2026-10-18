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
    const body = await req.json().catch(() => ({}));
    const { isAvailable } = body;

    let nextAvailable: boolean;

    if (typeof isAvailable === "boolean") {
      nextAvailable = isAvailable;
    } else {
      // Query current state to flip it
      const { data: current, error: fetchErr } = await supabase
        .from("menu_items")
        .select("is_available")
        .eq("id", id)
        .single();

      if (fetchErr || !current) {
        return NextResponse.json({ error: "Dish not found" }, { status: 404 });
      }

      nextAvailable = !current.is_available;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .update({ is_available: nextAvailable })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase toggle availability error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: formatItem(data as DbMenuItem) });
  } catch (error) {
    console.error("Failed to toggle dish availability:", error);
    return NextResponse.json(
      { error: "Failed to toggle availability" },
      { status: 500 }
    );
  }
}
