"use client";

import { useState, useMemo, FC } from "react";
import { UtensilsCrossed } from "lucide-react";
import { useMenuQuery } from "@/lib/customer/use-menu-query";
import { useDietaryFilter, DietaryFilter } from "@/lib/customer/use-dietary-filter";
import { CustomerTopbar } from "@/components/customer/customer-topbar";
import { HeroBanner } from "@/components/customer/hero-banner";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { DishCard } from "@/components/customer/dish-card";
import { VegTag } from "@/components/ui/veg-tag";
import styles from "./page.module.scss";

const CustomerMenuPage: FC = () => {
  const { data, isLoading, error } = useMenuQuery();
  const { filter: dietaryFilter, setFilter: setDietaryFilter } = useDietaryFilter();

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  const categories = useMemo(() => data?.categories ?? [], [data?.categories]);

  // Total dishes across all categories
  const totalDishCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [categories]);

  // Filter categories and dishes based on category and dietary tabs
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (activeCategoryId === "all") return true;
        return cat.id === activeCategoryId;
      })
      .map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          if (dietaryFilter === "VEG" && !item.isVeg) return false;
          if (dietaryFilter === "NON_VEG" && item.isVeg) return false;
          return true;
        });

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, activeCategoryId, dietaryFilter]);

  const dietaryOptions: { key: DietaryFilter; label: string }[] = [
    { key: "ALL", label: "All Dishes" },
    { key: "VEG", label: "Veg Only" },
    { key: "NON_VEG", label: "Non-Veg" },
  ];

  return (
    <div className={styles.page}>
      {/* Search & Action Topbar (Clicking Search Pill navigates to /search) */}
      <CustomerTopbar />

      {/* Hero Announcement Banner */}
      <HeroBanner />

      {/* Real Menu Listing (Replacing Popular Brands) */}
      <section className={styles.menuSection} id="menu" aria-label="Restaurant Menu">
        <div className={styles.sectionHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.sectionTitle}>Explore Our Menu</h2>
            <p className={styles.sectionSubtitle}>
              Freshly prepared delicacies and signature specialties from our kitchen
            </p>
          </div>

          {/* Quick Dietary Filters */}
          <div className={styles.dietaryPills}>
            {dietaryOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`${styles.dietaryButton} ${
                  dietaryFilter === opt.key ? styles.dietaryButtonActive : ""
                }`}
                onClick={() => setDietaryFilter(opt.key)}
              >
                {opt.key === "VEG" && <VegTag dietary="VEG" />}
                {opt.key === "NON_VEG" && <VegTag dietary="NON_VEG" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        {categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
            totalDishCount={totalDishCount}
          />
        )}

        {/* Dish Grid */}
        {isLoading ? (
          <div className={styles.loadingGrid} aria-label="Loading menu">
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : error ? (
          <div className={styles.emptyCard}>
            <UtensilsCrossed size={40} />
            <h3>Unable to load menu</h3>
            <p>Please check your connection and refresh the page to view dishes.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className={styles.emptyCard}>
            <UtensilsCrossed size={40} />
            <h3>No dishes match your selection</h3>
            <p>
              {dietaryFilter === "VEG"
                ? "No vegetarian dishes found in this category."
                : "No dishes currently available in this category."}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} className={styles.categoryGroup}>
              <div className={styles.categoryHeading}>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <span className={styles.dishCount}>
                  ({category.items.length}{" "}
                  {category.items.length === 1 ? "dish" : "dishes"})
                </span>
              </div>

              <div className={styles.dishGrid}>
                {category.items.map((item) => (
                  <DishCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
};

export default CustomerMenuPage;
