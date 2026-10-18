import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email required" }, { status: 400 });
    }

    let query = supabase.from("users").select("*");
    if (userId) {
      query = query.eq("id", userId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      // Table may not exist yet in Supabase
      return NextResponse.json({ user: null, message: error.message });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, phone, role = "CUSTOMER", photoURL } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userId = id || normalizedEmail;
    const isOwner = normalizedEmail === "03pavitar.dev@gmail.com";
    const userRole = isOwner ? "RESTAURANT_OWNER" : role;

    // 1. Check if user already exists by email or id
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${normalizedEmail},id.eq.${userId}`)
      .maybeSingle();

    if (existingUser) {
      // Reuse existing user - DO NOT create a new one!
      const effectiveId = existingUser.id;
      const finalRole = isOwner ? "RESTAURANT_OWNER" : (existingUser.role || userRole);

      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          name: name || existingUser.name,
          phone: phone !== undefined ? phone : existingUser.phone,
          photo_url: photoURL || existingUser.photo_url,
          role: finalRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", effectiveId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.warn("User update error in Supabase:", updateError.message);
      }

      return NextResponse.json({
        success: true,
        user: updatedUser || existingUser,
        isExisting: true,
      });
    }

    // 2. User does not exist, insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        phone: phone || null,
        role: userRole,
        photo_url: photoURL || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (insertError) {
      // Fallback in case of race condition or missing table
      console.warn("Supabase user insert warning:", insertError.message);
      return NextResponse.json({
        success: true,
        user: { id: userId, email: normalizedEmail, name, phone, role: userRole },
        warning: insertError.message,
      });
    }

    return NextResponse.json({ success: true, user: newUser, isExisting: false });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return NextResponse.json({ error: "Failed to save user profile" }, { status: 500 });
  }
}
