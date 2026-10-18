"use client";

import { FC } from "react";
import Link from "next/link";
import { Utensils, ShoppingBag, User } from "lucide-react";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { useCartTotalCount, useCartDrawerOpen } from "@/lib/customer/use-cart";
import { useDietaryFilter } from "@/lib/customer/use-dietary-filter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { VegTag } from "@/components/ui/veg-tag";
import styles from "./customer-header.module.scss";

export const CustomerHeader: FC = () => {
  const { data: sessionData } = useSessionQuery();
  const totalItems = useCartTotalCount();
  const [, setIsOpen] = useCartDrawerOpen();
  const { filter, setFilter } = useDietaryFilter();

  const isVegOnly = filter === "VEG";

  const handleToggleVeg = (checked: boolean) => {
    setFilter(checked ? "VEG" : "ALL");
  };

  const isAuthenticated = sessionData?.isAuthenticated ?? false;
  const userName = sessionData?.user?.name || "Guest";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <Utensils size={18} />
          </div>
          <div className={styles.brandName}>
            Dine<span>Direct</span>
          </div>
        </Link>

        <div className={styles.actions}>
          {/* Veg-Only Dietary Quick Filter */}
          <div className={styles.dietaryToggle}>
            <VegTag dietary="VEG" />
            <span className={styles.dietaryLabel}>Veg Only</span>
            <Switch
              checked={isVegOnly}
              onCheckedChange={handleToggleVeg}
              aria-label="Filter vegetarian only dishes"
            />
          </div>

          {isAuthenticated ? (
            <div className={styles.userLabel}>
              <span>{userName}</span>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">
                <User size={16} />
                <span>Owner</span>
              </Link>
            </Button>
          )}

          {/* Cart Trigger */}
          <Button
            variant="default"
            size="sm"
            className={styles.cartButton}
            onClick={() => setIsOpen(true)}
            aria-label={`View order with ${totalItems} items`}
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {totalItems > 0 && (
              <Badge variant="secondary" className={styles.cartBadge}>
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};
