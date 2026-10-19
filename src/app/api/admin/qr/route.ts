import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin/auth-guard";
import { fetchQRCodes, createQRCode, deleteQRCode } from "@/lib/firebase/qr-service";

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const items = await fetchQRCodes();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await req.json();
    const {
      type = "TABLE",
      name,
      tableNumber,
      location,
      campaignTitle,
      offerCode,
      discountReward,
      description,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Display name / Campaign title is required" },
        { status: 400 }
      );
    }

    if (type === "TABLE" && !tableNumber) {
      return NextResponse.json(
        { error: "Table number is required for Table QR" },
        { status: 400 }
      );
    }

    const item = await createQRCode({
      type,
      name,
      tableNumber,
      location,
      campaignTitle,
      offerCode,
      discountReward,
      description,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create QR:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  await deleteQRCode(id);
  return NextResponse.json({ success: true });
}
