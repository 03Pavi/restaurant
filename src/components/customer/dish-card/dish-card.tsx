"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Clock, Utensils, Plus } from "lucide-react";
import { MenuItem } from "@/lib/customer/use-menu-query";
import { useCartItemQty, useAddToCart, useRemoveFromCart } from "@/lib/customer/use-cart";
import { formatCurrency } from "@/lib/shared/formatters";
import { VegTag } from "@/components/ui/veg-tag";
import { Stepper } from "@/components/ui/stepper";
import styles from "./dish-card.module.scss";

export interface CustomerDishCardProps {
  item: MenuItem;
}

export const DishCard: FC<CustomerDishCardProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const qty = useCartItemQty(item.id);
  const addToCart = useAddToCart();
  const removeFromCart = useRemoveFromCart();

  const isAvailable = item.isAvailable;

  const handleAdd = () => {
    if (!isAvailable) return;
    addToCart(item.id);
  };

  const handleIncrement = () => {
    if (!isAvailable) return;
    addToCart(item.id);
  };

  const handleDecrement = () => {
    removeFromCart(item.id);
  };

  return (
    <article
      className={`${styles.card} ${!isAvailable ? styles.cardUnavailable : ""}`}
      aria-label={item.name}
    >
      <div className={styles.imageWrapper}>
        {item.imageUrl && !imgError ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.image}
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className={styles.placeholderImage}>
            <Utensils size={32} />
          </div>
        )}

        {!isAvailable && (
          <div className={styles.unavailableOverlay}>
            <span className={styles.unavailableText}>Currently unavailable</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.dietaryWrapper}>
              <VegTag dietary={item.isVeg ? "VEG" : "NON_VEG"} />
            </div>
            <h3 className={styles.title}>{item.name}</h3>
          </div>
          <span className={styles.price}>{formatCurrency(item.price)}</span>
        </div>

        <p className={styles.description}>
          {item.description || "Freshly crafted using our signature kitchen recipe."}
        </p>

        <div className={styles.footer}>
          <div className={styles.prepTime}>
            <Clock size={13} />
            <span>{item.prepTimeMins || 20} mins</span>
          </div>

          <div className={styles.actionArea}>
            {!isAvailable ? (
              <span className={styles.unavailableBadge}>Sold Out</span>
            ) : qty > 0 ? (
              <Stepper
                value={qty}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                min={0}
              />
            ) : (
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAdd}
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus size={14} />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
