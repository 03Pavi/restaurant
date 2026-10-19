import { NextRequest, NextResponse } from "next/server";
import { recordQRScan } from "@/lib/firebase/qr-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId } = body;

    if (!tableId) {
      return NextResponse.json({ error: "tableId is required" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || undefined;

    await recordQRScan(tableId, { userAgent, ip });
    return NextResponse.json({ recorded: true });
  } catch (error) {
    console.warn("Scan log error:", error);
    return NextResponse.json({ recorded: false }, { status: 500 });
  }
}
