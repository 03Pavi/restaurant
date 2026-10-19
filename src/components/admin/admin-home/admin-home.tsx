"use client";

import { FC, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  QrCode,
  Tag,
  Plus,
  FolderPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Flame,
} from "lucide-react";
import {
  AdminMenuItem,
  useAdminMenuQuery,
  useToggleAvailabilityMutation,
} from "@/lib/admin/use-menu-management";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { Button } from "@/components/ui/button";
import { VegTag } from "@/components/ui/veg-tag";
import { DishCard } from "@/components/admin/dish-card";
import { DishFormModal } from "@/components/admin/dish-form";
import { CategoryFormModal } from "@/components/admin/category-form";
import { QRManager } from "@/components/admin/qr-manager";
import { OffersManager } from "@/components/admin/offers-manager";
import styles from "./admin-home.module.scss";

export type AdminHomeTab = "menu" | "qr" | "offers";

export const AdminHome: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AdminHomeTab) || "menu";

  const [activeTab, setActiveTab] = useState<AdminHomeTab>(
    ["menu", "qr", "offers"].includes(initialTab) ? initialTab : "menu"
  );

  // Sync with URL query
  useEffect(() => {
    const tabParam = searchParams.get("tab") as AdminHomeTab;
    if (tabParam && ["menu", "qr", "offers"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AdminHomeTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };


  const { data: sessionData } = useSessionQuery();
  const { data: menuData, isLoading: isMenuLoading } = useAdminMenuQuery();
  const toggleAvailabilityMutation = useToggleAvailabilityMutation();

  const categories = useMemo(() => menuData?.categories ?? [], [menuData?.categories]);

  // Menu Category Filter State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "OUT_OF_STOCK">("ALL");

  // Modals
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  const ownerName = sessionData?.user?.name || "Pavitar Singh";

  // Total dish counts
  const totalDishes = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [categories]);

  const outOfStockCount = useMemo(() => {
    return categories.reduce(
      (sum, cat) => sum + cat.items.filter((item) => !item.isAvailable).length,
      0
    );
  }, [categories]);

  // Filtered categories and dishes
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (selectedCategoryId === "all") return true;
        return cat.id === selectedCategoryId;
      })
      .map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          // Search query
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchesName = item.name.toLowerCase().includes(q);
            const matchesDesc = (item.description || "").toLowerCase().includes(q);
            if (!matchesName && !matchesDesc) return false;
          }

          // Dietary
          if (dietaryFilter === "VEG" && !item.isVeg) return false;
          if (dietaryFilter === "NON_VEG" && item.isVeg) return false;

          // Stock
          if (stockFilter === "IN_STOCK" && !item.isAvailable) return false;
          if (stockFilter === "OUT_OF_STOCK" && item.isAvailable) return false;

          return true;
        });

        return {
          ...cat,
          items: filteredItems,
        };
      })
      .filter((cat) => cat.items.length > 0 || (selectedCategoryId === cat.id && !searchQuery));
  }, [categories, selectedCategoryId, searchQuery, dietaryFilter, stockFilter]);

  const handleEditDish = (item: AdminMenuItem) => {
    setEditingItem(item);
    setIsDishModalOpen(true);
  };

  const handleOpenAddDish = () => {
    if (categories.length === 0) {
      setIsCategoryModalOpen(true);
      return;
    }
    setEditingItem(null);
    setIsDishModalOpen(true);
  };


  const handleToggleAvailability = (id: string, isAvailable: boolean) => {
    toggleAvailabilityMutation.mutate({ id, isAvailable });
  };

  return (
    <div className={styles.adminPageWrapper}>
      {/* 1. RESTAURANT OWNER COMMAND HEADER */}
      <section className={styles.commandHeader}>
        <div className={styles.commandHeaderTop}>
          <div className={styles.greetingArea}>
            <div className={styles.ownerBadge}>
              <Flame size={15} className={styles.flameIcon} />
              <span>Restaurant Owner Command Center</span>
            </div>
            <h1 className={styles.headerTitle}>Welcome back, {ownerName}</h1>
            <p className={styles.headerSubtitle}>
              Live operations hub for DineDirect. Manage menu categories, direct dine-in QR codes, and promotional coupons without aggregator cuts.
            </p>
          </div>

          <div className={styles.quickStatusBadge}>
            <span className={styles.liveIndicatorPulse} />
            <span className={styles.liveStatusText}>Live &amp; Accepting Orders</span>
          </div>
        </div>

        {/* 2. THREE PRIMARY ADMIN ACTION HUBS */}
        <div className={styles.actionTabsBar}>
          <button
            type="button"
            className={`${styles.actionTabButton} ${activeTab === "menu" ? styles.actionTabButtonActive : ""}`}
            onClick={() => handleTabChange("menu")}
          >
            <div className={styles.tabIcon}>
              <UtensilsCrossed size={18} />
            </div>
            <div className={styles.tabTextGroup}>
              <span className={styles.tabTitle}>Menu &amp; Items</span>
              <span className={styles.tabSub}>{totalDishes} Dishes • {categories.length} Categories</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.actionTabButton} ${activeTab === "qr" ? styles.actionTabButtonActive : ""}`}
            onClick={() => handleTabChange("qr")}
          >
            <div className={styles.tabIcon}>
              <QrCode size={18} />
            </div>
            <div className={styles.tabTextGroup}>
              <span className={styles.tabTitle}>QR &amp; Scans</span>
              <span className={styles.tabSub}>6 Active Spots • 68 Scans Today</span>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.actionTabButton} ${activeTab === "offers" ? styles.actionTabButtonActive : ""}`}
            onClick={() => handleTabChange("offers")}
          >
            <div className={styles.tabIcon}>
              <Tag size={18} />
            </div>
            <div className={styles.tabTextGroup}>
              <span className={styles.tabTitle}>Offers &amp; Coupons</span>
              <span className={styles.tabSub}>3 Live Codes • ₹7,040 Direct Savings</span>
            </div>
          </button>
        </div>
      </section>

      {/* 3. TAB 1: MENU & DISH ITEMS MANAGEMENT */}
      {activeTab === "menu" && (
        <section className={styles.menuStudioSection} aria-label="Menu and Items Management">
          {/* Action Bar */}
          <div className={styles.studioActionBar}>
            <div className={styles.searchAndFilter}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search dishes by name or ingredient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Dietary Filter Pills */}
              <div className={styles.filterPills}>
                <button
                  type="button"
                  className={`${styles.filterPill} ${dietaryFilter === "ALL" ? styles.filterPillActive : ""}`}
                  onClick={() => setDietaryFilter("ALL")}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${dietaryFilter === "VEG" ? styles.filterPillActive : ""}`}
                  onClick={() => setDietaryFilter("VEG")}
                >
                  <VegTag dietary="VEG" />
                  <span>Veg Only</span>
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${dietaryFilter === "NON_VEG" ? styles.filterPillActive : ""}`}
                  onClick={() => setDietaryFilter("NON_VEG")}
                >
                  <VegTag dietary="NON_VEG" />
                  <span>Non-Veg</span>
                </button>
              </div>

              {/* Stock Filter Pills */}
              <div className={styles.filterPills}>
                <button
                  type="button"
                  className={`${styles.filterPill} ${stockFilter === "ALL" ? styles.filterPillActive : ""}`}
                  onClick={() => setStockFilter("ALL")}
                >
                  All Stock
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${stockFilter === "IN_STOCK" ? styles.filterPillActive : ""}`}
                  onClick={() => setStockFilter("IN_STOCK")}
                >
                  In Stock
                </button>
                <button
                  type="button"
                  className={`${styles.filterPill} ${stockFilter === "OUT_OF_STOCK" ? styles.filterPillActive : ""}`}
                  onClick={() => setStockFilter("OUT_OF_STOCK")}
                >
                  Out of Stock ({outOfStockCount})
                </button>
              </div>
            </div>

            {/* Creation Action Buttons */}
            <div className={styles.creationButtons}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCategoryModalOpen(true)}
              >
                <FolderPlus size={16} />
                <span>Create Category</span>
              </Button>
              <Button
                variant="default"
                size="md"
                onClick={handleOpenAddDish}
              >
                <Plus size={16} />
                <span>Create Menu Item</span>
              </Button>
            </div>
          </div>

          {/* Category Tabs Pill Row */}
          {categories.length > 0 && (
            <div className={styles.categoryPillsWrapper}>
              <button
                type="button"
                className={`${styles.categoryPill} ${selectedCategoryId === "all" ? styles.categoryPillActive : ""}`}
                onClick={() => setSelectedCategoryId("all")}
              >
                <span>All Dishes</span>
                <span className={styles.categoryPillCount}>{totalDishes}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.categoryPill} ${selectedCategoryId === cat.id ? styles.categoryPillActive : ""}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <span>{cat.name}</span>
                  <span className={styles.categoryPillCount}>{cat.items.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Dish Listings Grid */}
          {isMenuLoading ? (
            <div className={styles.loadingGrid}>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyState}>
              <UtensilsCrossed size={48} className={styles.emptyIcon} />
              <h3>Your Menu is Empty</h3>
              <p>Start offering dishes directly to diners by adding your first food category and culinary creation.</p>
              <div className={styles.emptyActions}>
                <Button variant="outline" size="md" onClick={() => setIsCategoryModalOpen(true)}>
                  <FolderPlus size={16} />
                  <span>Create Menu Category</span>
                </Button>
                <Button variant="default" size="md" onClick={handleOpenAddDish}>
                  <Plus size={16} />
                  <span>Create Menu Item</span>
                </Button>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className={styles.emptyState}>
              <AlertCircle size={44} className={styles.emptyIcon} />
              <h3>No dishes match your filter</h3>
              <p>Try clearing your search query or switching dietary / stock filters.</p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDietaryFilter("ALL");
                  setStockFilter("ALL");
                  setSelectedCategoryId("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className={styles.categoryGroups}>
              {filteredCategories.map((category) => (
                <div key={category.id} className={styles.categoryGroup}>
                  <div className={styles.categoryHeader}>
                    <div className={styles.categoryTitleArea}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <span className={styles.categoryDishCount}>
                        {category.items.length} {category.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        handleOpenAddDish();
                      }}
                      className={styles.addDishQuick}
                    >
                      <Plus size={14} />
                      <span>Add to {category.name}</span>
                    </Button>
                  </div>

                  <div className={styles.dishGrid}>
                    {category.items.map((item) => (
                      <DishCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditDish}
                        onToggleAvailability={handleToggleAvailability}
                        isToggling={toggleAvailabilityMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. TAB 2: QR & TABLE SCANS */}
      {activeTab === "qr" && (
        <section className={styles.qrSection} aria-label="QR and Table Scans Studio">
          <QRManager />
        </section>
      )}

      {/* 5. TAB 3: OFFERS & PROMO COUPONS */}
      {activeTab === "offers" && (
        <section className={styles.offersSection} aria-label="Offers and Coupons Studio">
          <OffersManager />
        </section>
      )}

      {/* Modals for Adding / Editing */}
      <DishFormModal
        isOpen={isDishModalOpen}
        onClose={() => {
          setIsDishModalOpen(false);
          setEditingItem(null);
        }}
        categories={categories}
        defaultCategoryId={selectedCategoryId !== "all" ? selectedCategoryId : categories[0]?.id}
        initialData={editingItem}
      />

      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        nextSortOrder={categories.length}
      />
    </div>
  );
};
