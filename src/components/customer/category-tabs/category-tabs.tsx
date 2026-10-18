"use client";

import { FC } from "react";
import { MenuCategory } from "@/lib/customer/use-menu-query";
import styles from "./category-tabs.module.scss";

export interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  totalDishCount: number;
}

export const CategoryTabs: FC<CategoryTabsProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  totalDishCount,
}) => {
  return (
    <nav className={styles.container} aria-label="Menu categories">
      <div className={styles.tabList}>
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeCategoryId === "all" ? styles.tabActive : ""
          }`}
          onClick={() => onSelectCategory("all")}
        >
          <span>All Dishes</span>
          <span className={styles.countBadge}>{totalDishCount}</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.tabButton} ${
              activeCategoryId === cat.id ? styles.tabActive : ""
            }`}
            onClick={() => onSelectCategory(cat.id)}
          >
            <span>{cat.name}</span>
            <span className={styles.countBadge}>{cat.items.length}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
