"use client";

import { FC, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Store,
  Utensils,
  Bell,
  ShoppingBag,
} from "lucide-react";
import { useCartTotalCount, useCartDrawerOpen } from "@/lib/customer/use-cart";
import { Badge } from "@/components/ui/badge";
import styles from "./customer-topbar.module.scss";

export interface CustomerTopbarProps {
  activeSegment?: "restaurants" | "dishes";
  onSegmentChange?: (segment: "restaurants" | "dishes") => void;
}

const SEARCH_PLACEHOLDERS = [
  "Aloo Paratha",
  "Maggi",
  "Crispy Corn",
  "Aloo poori",
];

export const CustomerTopbar: FC<CustomerTopbarProps> = ({
  activeSegment = "restaurants",
  onSegmentChange,
}) => {
  const [segment, setSegment] = useState<"restaurants" | "dishes">(activeSegment);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const totalCount = useCartTotalCount();
  const [, setIsOpen] = useCartDrawerOpen();

  const totalPlaceholders = SEARCH_PLACEHOLDERS.length;

  useEffect(() => {
    if (totalPlaceholders <= 1) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % totalPlaceholders);
    }, 2200);

    return () => clearInterval(interval);
  }, [totalPlaceholders]);

  // Guaranteed valid non-empty dish name at all times
  const currentPlaceholder =
    SEARCH_PLACEHOLDERS[placeholderIndex % totalPlaceholders] ||
    SEARCH_PLACEHOLDERS[0] ||
    "dishes";

  const handleSelectSegment = (val: "restaurants" | "dishes") => {
    setSegment(val);
    onSegmentChange?.(val);
  };

  return (
    <header className={styles.topbar}>
      {/* Clickable Search Pill leading to Search Page with running rotating placeholder */}
      <Link href="/search" className={styles.searchPill} aria-label="Open search page">
        <Search size={16} className={styles.searchIcon} />
        <div className={styles.placeholderWrapper}>
          <span className={styles.placeholderPrefix}>Search</span>
          <span key={currentPlaceholder} className={styles.animatedPlaceholder}>
            &ldquo;{currentPlaceholder}&rdquo;
          </span>
        </div>
        <SlidersHorizontal size={15} className={styles.filterIcon} />
      </Link>

      {/* Segmented Filter Pills */}
      {/* <div className={styles.centerActions}>
        <div className={styles.segmentedPillGroup}>
          <button
            type="button"
            className={`${styles.segmentButton} ${
              segment === "restaurants" ? styles.segmentButtonActive : ""
            }`}
            onClick={() => handleSelectSegment("restaurants")}
          >
            <Store size={14} />
            <span>Restaurants</span>
          </button>
          <button
            type="button"
            className={`${styles.segmentButton} ${
              segment === "dishes" ? styles.segmentButtonActive : ""
            }`}
            onClick={() => handleSelectSegment("dishes")}
          >
            <Utensils size={14} />
            <span>Dishes</span>
          </button>
        </div>
      </div> */}

      {/* Notifications & Mobile Cart Trigger */}
      <div className={styles.rightArea}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className={styles.notificationDot} />
        </button>

        {/* Mobile-only cart button */}
        <button
          type="button"
          className={`${styles.iconButton} ${styles.mobileCartBtn}`}
          onClick={() => setIsOpen(true)}
          aria-label="Open cart"
          title="Open cart"
        >
          <ShoppingBag size={18} />
          {totalCount > 0 && (
            <Badge variant="default" className={styles.cartBadge}>
              {totalCount}
            </Badge>
          )}
        </button>
      </div>
    </header>
  );
};
