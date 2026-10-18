import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  let isAuthenticated = !!req.auth;
  let isRestaurantOwner = req.auth?.user?.role === "RESTAURANT_OWNER";

  // Also check DineDirect session cookie for Firebase/Google sign-in
  if (!isAuthenticated) {
    const sessionCookie = req.cookies.get("dinedirect_session");
    if (sessionCookie?.value) {
      try {
        const decoded = JSON.parse(sessionCookie.value);
        if (decoded?.email) {
          isAuthenticated = true;
          isRestaurantOwner =
            decoded.role === "RESTAURANT_OWNER" ||
            decoded.email?.toLowerCase() === "03pavitar.dev@gmail.com";
        }
      } catch {
        // ignore invalid cookie
      }
    }
  }

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isAuthenticated || !isRestaurantOwner) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
