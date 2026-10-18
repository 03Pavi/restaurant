"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Clock, Edit2, Utensils } from "lucide-react";
import { AdminMenuItem } from "@/lib/admin/use-menu-management";
import { formatCurrency } from "@/lib/shared/formatters";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VegTag } from "@/components/ui/veg-tag";
import styles from "./dish-card.module.scss";

export interface DishCardProps {
  item: AdminMenuItem;
  onEdit: (item: AdminMenuItem) => void;
  onToggleAvailability: (id: string, isAvailable: boolean) => void;
  isToggling?: boolean;
}

export const DishCard: FC<DishCardProps> = ({
  item,
  onEdit,
  onToggleAvailability,
  isToggling = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const isAvailable = item.isAvailable;

  return (
    <div className={`${styles.card} ${!isAvailable ? styles.cardUnavailable : ""}`}>
      <div className={styles.imageContainer}>
        {item.imageUrl && !imgError ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.image}
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Utensils size={32} />
          </div>
        )}

        {!isAvailable && (
          <div className={styles.outOfStockOverlay}>
            <Badge variant="destructive" className={styles.outOfStockBadge}>
              OUT OF STOCK
            </Badge>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <VegTag dietary={item.isVeg ? "VEG" : "NON_VEG"} />
            <h4 className={styles.title}>{item.name}</h4>
          </div>
          <span className={styles.price}>{formatCurrency(item.price)}</span>
        </div>

        <p className={styles.description}>{item.description || "No description provided."}</p>

        <div className={styles.metaRow}>
          <div className={styles.prepTime}>
            <Clock size={13} />
            <span>{item.prepTimeMins} mins</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.availabilityGroup}>
          <Switch
            checked={isAvailable}
            disabled={isToggling}
            onCheckedChange={(checked) => onToggleAvailability(item.id, checked)}
            aria-label="Toggle dish availability"
          />
          <span className={styles.availabilityLabel}>
            {isAvailable ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            title="Edit dish details"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
