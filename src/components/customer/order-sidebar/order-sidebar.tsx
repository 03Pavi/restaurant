"use client";

import { FC } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import {
  useCartTable,
  useCartOrderType,
  useAddToCart,
  useRemoveFromCart,
  useCartTotalCount,
  OrderType,
} from "@/lib/customer/use-cart";
import { useVerifiedCartQuery } from "@/lib/customer/use-verified-cart-query";
import { formatCurrency } from "@/lib/shared/formatters";
import { VegTag } from "@/components/ui/veg-tag";
import { Stepper } from "@/components/ui/stepper";
import { Input } from "@/components/ui/input";
import styles from "./order-sidebar.module.scss";

export const OrderSidebar: FC = () => {
  const [tableNumber, setTableNumber] = useCartTable();
  const [orderType, setOrderType] = useCartOrderType();
  const totalCount = useCartTotalCount();

  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();

  const { data } = useVerifiedCartQuery();
  const lineItems = data?.lineItems ?? [];
  const subtotal = data?.subtotal ?? 0;

  const orderTypes: { key: OrderType; label: string }[] = [
    { key: "DINE_IN", label: "Dine-In" },
    { key: "TAKEAWAY", label: "Takeaway" },
    { key: "DELIVERY", label: "Delivery" },
  ];

  return (
    <aside className={styles.orderSidebar} aria-label="Order Bag">
      <div className={styles.header}>
        <h2 className={styles.title}>Order Bag</h2>
        {totalCount > 0 && (
          <span className={styles.countBadge}>
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {lineItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.bagCircle}>
            <ShoppingBag size={30} />
          </div>
          <h3 className={styles.emptyTitle}>Your order is empty</h3>
          <p className={styles.emptySubtitle}>
            Explore delicious dishes and add them to your order menu.
          </p>
        </div>
      ) : (
        <>
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
                <label className={styles.configLabel} htmlFor="sidebar-table-number">
                  Table Number
                </label>
                <Input
                  id="sidebar-table-number"
                  placeholder="e.g. Table 4"
                  value={tableNumber || ""}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className={styles.tableInput}
                />
              </div>
            )}
          </section>

          <div className={styles.itemList}>
            {lineItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemMeta}>
                  <VegTag dietary={item.isVeg ? "VEG" : "NON_VEG"} />
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>

                <Stepper
                  value={item.qty}
                  onIncrement={() => addToCart(item.id)}
                  onDecrement={() => removeFromCart(item.id)}
                  min={0}
                />
              </div>
            ))}
          </div>

          <footer className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>

            <Link href="/checkout" className={styles.checkoutButton}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>
          </footer>
        </>
      )}
    </aside>
  );
};
