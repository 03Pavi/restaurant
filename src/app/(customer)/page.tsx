"use client";

import { useState, useMemo, FC } from "react";
import { UtensilsCrossed, Plus, FolderPlus } from "lucide-react";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { useMenuQuery } from "@/lib/customer/use-menu-query";
import { useDietaryFilter, DietaryFilter } from "@/lib/customer/use-dietary-filter";
import { CustomerTopbar } from "@/components/customer/customer-topbar";
import { HeroBanner } from "@/components/customer/hero-banner";
import { CategoryTabs } from "@/components/customer/category-tabs";
import { DishCard } from "@/components/customer/dish-card";
import { VegTag } from "@/components/ui/veg-tag";
import { Button } from "@/components/ui/button";
import { CategoryFormModal } from "@/components/admin/category-form";
import { DishFormModal } from "@/components/admin/dish-form";
import { AdminHome } from "@/components/admin/admin-home";
import styles from "./page.module.scss";

const CustomerMenuPage: FC = () => {
  const { data: sessionData } = useSessionQuery();
  const isOwner = sessionData?.user?.role === "RESTAURANT_OWNER";

  const { data, isLoading, error } = useMenuQuery();
  const { filter: dietaryFilter, setFilter: setDietaryFilter } = useDietaryFilter();

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

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

  // If user is Restaurant Owner / Admin, show the Admin Home UI
  if (isOwner) {
    return <AdminHome />;
  }

  const dietaryOptions: { key: DietaryFilter; label: string }[] = [
    { key: "ALL", label: "All Dishes" },
    { key: "VEG", label: "Veg Only" },
    { key: "NON_VEG", label: "Non-Veg" },
  ];

  return (
    <div className={styles.page}>
      {/* Search & Action Topbar */}
      <CustomerTopbar />

      {/* Hero Announcement Banner */}
      <HeroBanner />

      {/* Menu Listing */}
      <section className={styles.menuSection} id="menu" aria-label="Restaurant Menu">
        <div className={styles.sectionHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.sectionTitle}>Explore Our Menu</h2>
            <p className={styles.sectionSubtitle}>
              Freshly prepared delicacies and signature specialties from our kitchen
            </p>
          </div>

          <div className={styles.filtersRow}>
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

            {/* Admin Quick Action Buttons */}
            {isOwner && (
              <div className={styles.adminActionGroup}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <FolderPlus size={16} />
                  <span>Create Category</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsDishModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Create Menu Item</span>
                </Button>
              </div>
            )}
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
            {isOwner && (
              <div className={styles.emptyAdminActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <FolderPlus size={16} />
                  <span>Create Category</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsDishModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Create Menu Item</span>
                </Button>
              </div>
            )}
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

      {/* Creation Modals */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        nextSortOrder={categories.length}
      />

      <DishFormModal
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        categories={categories}
        defaultCategoryId={categories[0]?.id}
      />
    </div>
  );
};

export default CustomerMenuPage;
