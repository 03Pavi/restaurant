import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ addresses: [] });
    }

    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ addresses: [], warning: error.message });
    }

    const formatted = (data || []).map((row: any) => ({
      id: row.id,
      label: row.label,
      receiverName: row.receiver_name,
      phone: row.phone,
      street: row.street,
      apartment: row.apartment,
      city: row.city,
      postalCode: row.postal_code,
      deliveryNotes: row.delivery_notes,
      isDefault: row.is_default,
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ addresses: formatted });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ addresses: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      userId,
      label,
      receiverName,
      phone,
      street,
      apartment,
      city,
      postalCode,
      deliveryNotes,
      isDefault,
      latitude,
      longitude,
    } = body;

    if (!userId || !street || !city) {
      return NextResponse.json(
        { error: "userId, street, and city are required." },
        { status: 400 }
      );
    }

    const addressId = id || `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // If setting default, unset existing default
    if (isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const upsertPayload: Record<string, any> = {
      id: addressId,
      user_id: userId,
      label: label || "Home",
      receiver_name: receiverName,
      phone: phone || null,
      street,
      apartment: apartment || null,
      city,
      postal_code: postalCode || null,
      delivery_notes: deliveryNotes || null,
      is_default: Boolean(isDefault),
      updated_at: new Date().toISOString(),
    };

    if (typeof latitude === "number") upsertPayload.latitude = latitude;
    if (typeof longitude === "number") upsertPayload.longitude = longitude;

    let { data, error } = await supabase
      .from("user_addresses")
      .upsert(upsertPayload, { onConflict: "id" })
      .select()
      .maybeSingle();

    // If latitude or longitude columns are not yet in Supabase schema cache, retry without them
    if (error && (error.message.includes("latitude") || error.message.includes("longitude"))) {
      delete upsertPayload.latitude;
      delete upsertPayload.longitude;
      const retryResult = await supabase
        .from("user_addresses")
        .upsert(upsertPayload, { onConflict: "id" })
        .select()
        .maybeSingle();

      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.warn("Supabase user_addresses save notice:", error.message);
      return NextResponse.json({
        success: true,
        address: {
          id: addressId,
          userId,
          label,
          receiverName,
          phone,
          street,
          apartment,
          city,
          postalCode,
          deliveryNotes,
          latitude,
          longitude,
          isDefault: Boolean(isDefault),
        },
        warning: error.message,
      });
    }

    return NextResponse.json({ success: true, address: data });
  } catch (error) {
    console.error("Error saving address:", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }

    const { error } = await supabase.from("user_addresses").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
