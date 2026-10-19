import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin/auth-guard";
import {
  fetchOffers,
  createOffer,
  updateOfferStatus,
  deleteOffer,
} from "@/lib/firebase/offers-service";

export async function GET(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  const items = await fetchOffers();
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
      code,
      discountType,
      discountValue,
      minOrderValue = 0,
      maxDiscount,
      expiryDate,
      description,
    } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "code, discountType, and discountValue are required" },
        { status: 400 }
      );
    }

    const item = await createOffer({
      code,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate: expiryDate || "2026-12-31",
      description,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await verifyAdminAuth(req);
  if (!authResult.authorized && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await req.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "id and isActive (boolean) are required" },
        { status: 400 }
      );
    }

    await updateOfferStatus(id, isActive);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
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

  await deleteOffer(id);
  return NextResponse.json({ success: true });
}
