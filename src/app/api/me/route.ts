import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Check NextAuth server session
    const session = await auth();

    if (session && session.user) {
      return NextResponse.json(
        {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
          },
          isAuthenticated: true,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 2. Check DineDirect Firebase/OAuth session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("dinedirect_session");

    if (sessionCookie?.value) {
      try {
        const decoded = JSON.parse(sessionCookie.value);
        if (decoded?.email) {
            return NextResponse.json(
              {
                user: {
                  id: decoded.id || decoded.email,
                  email: decoded.email,
                  name: decoded.name || decoded.email.split("@")[0],
                  role: decoded.role || "CUSTOMER",
                  photoURL: decoded.photoURL || null,
                },
                isAuthenticated: true,
              },
              {
                headers: {
                  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
              }
            );
          }
        } catch (parseErr) {
          console.error("Error parsing dinedirect_session cookie:", parseErr);
        }
      }

      return NextResponse.json(
        {
          user: null,
          isAuthenticated: false,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    } catch (error) {
      console.error("Error reading session in /api/me:", error);
      return NextResponse.json(
        {
          user: null,
          isAuthenticated: false,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }
  }
