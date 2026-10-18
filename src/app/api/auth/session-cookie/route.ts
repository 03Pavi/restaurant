import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, role = "CUSTOMER", photoURL } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userRole =
      normalizedEmail === "03pavitar.dev@gmail.com" || role === "RESTAURANT_OWNER"
        ? "RESTAURANT_OWNER"
        : role;

    const sessionPayload = {
      id: id || normalizedEmail,
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0],
      role: userRole,
      photoURL: photoURL || null,
    };

    const cookieStore = await cookies();
    cookieStore.set("dinedirect_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set("dinedirect_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error setting session cookie:", error);
    return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("dinedirect_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session cookie:", error);
    return NextResponse.json({ error: "Failed to clear session" }, { status: 500 });
  }
}
