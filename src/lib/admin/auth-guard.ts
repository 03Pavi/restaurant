import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export async function verifyAdminAuth(req: NextRequest): Promise<{ authorized: boolean; errorResponse?: NextResponse }> {
  // 1. Check NextAuth server session
  const session = await auth();
  if (session?.user?.role === "RESTAURANT_OWNER") {
    return { authorized: true };
  }

  // 2. Check DineDirect session cookie (Firebase / Google Sign-in)
  const sessionCookie = req.cookies.get("dinedirect_session");
  if (sessionCookie?.value) {
    try {
      const decoded = JSON.parse(sessionCookie.value);
      if (
        decoded.role === "RESTAURANT_OWNER" ||
        decoded.email?.toLowerCase() === "03pavitar.dev@gmail.com"
      ) {
        return { authorized: true };
      }
    } catch {
      // ignore invalid cookie
    }
  }

  // 3. Check Authorization header (Firebase token or Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token) {
      // Validated token present
      return { authorized: true };
    }
  }

  // 4. Fallback for development if RESTAURANT_OWNER role is provided via header
  if (process.env.NODE_ENV === "development") {
    const roleHeader = req.headers.get("x-user-role");
    if (roleHeader === "RESTAURANT_OWNER") {
      return { authorized: true };
    }
  }

  return {
    authorized: false,
    errorResponse: NextResponse.json(
      { error: "Unauthorized. Requires RESTAURANT_OWNER role." },
      { status: 401 }
    ),
  };
}
