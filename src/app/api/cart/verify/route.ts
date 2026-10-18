import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { DbMenuItem, formatItem } from "@/lib/supabase/types";

export interface VerifiedLineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  itemTotal: number;
  isAvailable: boolean;
  imageUrl?: string | null;
  isVeg: boolean;
  prepTimeMins?: number;
}

// Standard UUID format validator to prevent PostgreSQL 22P02 invalid input syntax errors
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawItems: { menuItemId: string; qty: number }[] = body.items || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({
        lineItems: [],
        subtotal: 0,
        hasUnavailableItems: false,
      });
    }

    const uniqueIds = Array.from(
      new Set(rawItems.map((i) => i.menuItemId).filter(Boolean))
    );

    // Only query database with valid UUIDs to avoid PostgreSQL syntax errors on legacy/stale items
    const validUUIDs = uniqueIds.filter((id) => UUID_REGEX.test(id));
    let dbItems: DbMenuItem[] = [];

    if (validUUIDs.length > 0) {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .in("id", validUUIDs);

      if (!error && data) {
        dbItems = data as DbMenuItem[];
      }
    }

    const itemMap = new Map<string, ReturnType<typeof formatItem>>();
    for (const raw of dbItems) {
      const item = formatItem(raw);
      itemMap.set(item.id, item);
    }

    let subtotal = 0;
    let hasUnavailableItems = false;

    const lineItems: VerifiedLineItem[] = rawItems
      .filter((reqItem) => reqItem && reqItem.menuItemId && reqItem.qty > 0)
      .map((reqItem) => {
        const found = itemMap.get(reqItem.menuItemId);
        const qty = Number(reqItem.qty) || 1;

        if (!found) {
          hasUnavailableItems = true;
          return {
            id: reqItem.menuItemId,
            name: "Item No Longer Available",
            price: 0,
            qty,
            itemTotal: 0,
            isAvailable: false,
            imageUrl: null,
            isVeg: true,
          };
        }

        const isAvailable = Boolean(found.isAvailable);
        if (!isAvailable) {
          hasUnavailableItems = true;
        }

        const price = Number(found.price) || 0;
        const itemTotal = isAvailable ? price * qty : 0;
        if (isAvailable) {
          subtotal += itemTotal;
        }

        return {
          id: found.id,
          name: found.name,
          price,
          qty,
          itemTotal,
          isAvailable,
          imageUrl: found.imageUrl,
          isVeg: found.isVeg,
          prepTimeMins: found.prepTimeMins,
        };
      });

    return NextResponse.json({
      lineItems,
      subtotal,
      hasUnavailableItems,
    });
  } catch {
    // Return empty cart fallback instead of 500 error to keep client experience uninterrupted
    return NextResponse.json({
      lineItems: [],
      subtotal: 0,
      hasUnavailableItems: false,
    });
  }
}
