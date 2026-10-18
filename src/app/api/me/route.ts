import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({
        user: null,
        isAuthenticated: false,
      });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error reading session in /api/me:", error);
    return NextResponse.json({
      user: null,
      isAuthenticated: false,
    });
  }
}
