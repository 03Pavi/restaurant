"use client";

import { FC } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import {
  useCartDrawerOpen,
  useCartTable,
  useCartOrderType,
  useAddToCart,
  useRemoveFromCart,
  useCartTotalCount,
  OrderType,
} from "@/lib/customer/use-cart";
import { useVerifiedCartQuery } from "@/lib/customer/use-verified-cart-query";
import { formatCurrency } from "@/lib/shared/formatters";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VegTag } from "@/components/ui/veg-tag";
import { Stepper } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import styles from "./cart-drawer.module.scss";

export const CartDrawer: FC = () => {
  const [isOpen, setIsOpen] = useCartDrawerOpen();
  const [tableNumber, setTableNumber] = useCartTable();
  const [orderType, setOrderType] = useCartOrderType();
  const totalCount = useCartTotalCount();

  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();

  const { data, isLoading } = useVerifiedCartQuery();

  const lineItems = data?.lineItems ?? [];
  const subtotal = data?.subtotal ?? 0;
  const hasUnavailableItems = data?.hasUnavailableItems ?? false;

  const orderTypes: { key: OrderType; label: string }[] = [
    { key: "DINE_IN", label: "Dine-In" },
    { key: "TAKEAWAY", label: "Takeaway" },
    { key: "DELIVERY", label: "Delivery" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right">
        <div className={styles.drawerContent}>
          <SheetHeader className={styles.header}>
            <div className={styles.titleRow}>
              <SheetTitle className={styles.title}>Your Order</SheetTitle>
              {totalCount > 0 && (
                <span className={styles.countBadge}>
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </SheetHeader>

          {/* Table & Order Type Configuration */}
          <section className={styles.orderConfigSection} aria-label="Order Details">
            <div className={styles.configRow}>
              <label className={styles.configLabel}>Order Type</label>
              <div className={styles.typeButtonGroup}>
                {orderTypes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`${styles.typeButton} ${
                      orderType === t.key ? styles.typeButtonActive : ""
                    }`}
                    onClick={() => setOrderType(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {orderType === "DINE_IN" && (
              <div className={styles.configRow}>
                <label className={styles.configLabel} htmlFor="cart-table-number">
                  Table Number
                </label>
                <Input
                  id="cart-table-number"
                  placeholder="e.g. Table 4"
                  value={tableNumber || ""}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className={styles.tableInput}
                />
              </div>
            )}
          </section>

          {/* Cart Item List */}
          <div className={styles.itemList}>
            {isLoading ? (
              <div className={styles.loadingSkeleton}>
                <div className={styles.skeletonItem} />
                <div className={styles.skeletonItem} />
              </div>
            ) : lineItems.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag size={48} />
                <p>Your order is empty</p>
                <span>Add delicious dishes from the menu to start.</span>
              </div>
            ) : (
              lineItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <div className={styles.itemMeta}>
                    <VegTag dietary={item.isVeg ? "VEG" : "NON_VEG"} />
                    <div className={styles.itemDetails}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemPrice}>
                        {formatCurrency(item.price)}
                      </span>
                      {!item.isAvailable && (
                        <span className={styles.itemUnavailableWarning}>
                          Sold out (will not be charged)
                        </span>
                      )}
                    </div>
                  </div>

                  <Stepper
                    value={item.qty}
                    onIncrement={() => addToCart(item.id)}
                    onDecrement={() => removeFromCart(item.id)}
                    min={0}
                  />
                </div>
              ))
            )}
          </div>

          {/* Footer & CTA */}
          {lineItems.length > 0 && (
            <footer className={styles.footer}>
              {hasUnavailableItems && (
                <div className={styles.unavailableAlert}>
                  <AlertCircle size={14} style={{ display: "inline", marginRight: 4 }} />
                  Some items are out of stock and excluded from checkout.
                </div>
              )}

              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <Link
                href="/checkout"
                className={styles.checkoutButton}
                onClick={() => setIsOpen(false)}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
            </footer>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
