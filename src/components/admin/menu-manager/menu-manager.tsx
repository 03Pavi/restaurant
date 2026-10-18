"use client";

import { useState, FC } from "react";
import { Plus, FolderPlus, UtensilsCrossed } from "lucide-react";
import {
  AdminMenuItem,
  AdminMenuCategory,
  useAdminMenuQuery,
  useToggleAvailabilityMutation,
} from "@/lib/admin/use-menu-management";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DishCard } from "@/components/admin/dish-card";
import { DishFormModal } from "@/components/admin/dish-form";
import { CategoryFormModal } from "@/components/admin/category-form";
import styles from "./menu-manager.module.scss";

export const MenuManager: FC = () => {
  const { data, isLoading } = useAdminMenuQuery();
  const toggleAvailabilityMutation = useToggleAvailabilityMutation();

  const categories = data?.categories ?? [];

  const [activeTab, setActiveTab] = useState<string>("");
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);

  const currentTab = activeTab || categories[0]?.id || "";

  const handleEditDish = (item: AdminMenuItem) => {
    setEditingItem(item);
    setIsDishModalOpen(true);
  };

  const handleOpenAddDish = () => {
    setEditingItem(null);
    setIsDishModalOpen(true);
  };

  const handleToggle = (id: string, isAvailable: boolean) => {
    toggleAvailabilityMutation.mutate({ id, isAvailable });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Menu Management Studio</h1>
          <p className={styles.subtitle}>
            Organize culinary categories, adjust live pricing, and control item availability instantly.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <FolderPlus size={16} />
            <span>Add Category</span>
          </Button>

          <Button
            variant="default"
            size="md"
            onClick={handleOpenAddDish}
            disabled={categories.length === 0}
          >
            <Plus size={16} />
            <span>Add Dish</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loadingSkeleton}>
          Loading menu categories &amp; inventory...
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyCategory}>
          <UtensilsCrossed size={48} />
          <h3>No Menu Categories Found</h3>
          <p>Get started by creating your first menu category (e.g. Starters, Main Course).</p>
          <Button
            variant="default"
            size="md"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create First Category</span>
          </Button>
        </div>
      ) : (
        <Tabs value={currentTab} onValueChange={setActiveTab} className={styles.tabsContainer}>
          <TabsList className={styles.tabsListCustom}>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name} ({cat.items.length})
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              {cat.items.length === 0 ? (
                <div className={styles.emptyCategory}>
                  <UtensilsCrossed size={40} />
                  <h3>No dishes in &ldquo;{cat.name}&rdquo;</h3>
                  <p>Add a delicious dish to this category to showcase it to diners.</p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setActiveTab(cat.id);
                      handleOpenAddDish();
                    }}
                  >
                    <Plus size={14} />
                    <span>Add Dish to {cat.name}</span>
                  </Button>
                </div>
              ) : (
                <div className={styles.dishGrid}>
                  {cat.items.map((item) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditDish}
                      onToggleAvailability={handleToggle}
                      isToggling={toggleAvailabilityMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Dish Create/Edit Modal */}
      <DishFormModal
        isOpen={isDishModalOpen}
        onClose={() => {
          setIsDishModalOpen(false);
          setEditingItem(null);
        }}
        categories={categories}
        defaultCategoryId={currentTab}
        initialData={editingItem}
      />

      {/* Category Create Modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        nextSortOrder={categories.length}
      />
    </div>
  );
};
