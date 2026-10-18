"use client";

import { useState, useEffect, FC, FormEvent } from "react";
import { AdminMenuItem, AdminMenuCategory, useSaveItemMutation } from "@/lib/admin/use-menu-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VegTag } from "@/components/ui/veg-tag";
import styles from "./dish-form.module.scss";

export interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AdminMenuCategory[];
  defaultCategoryId?: string;
  initialData?: AdminMenuItem | null;
}

export const DishFormModal: FC<DishFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  defaultCategoryId,
  initialData,
}) => {
  const saveMutation = useSaveItemMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [prepTimeMins, setPrepTimeMins] = useState("20");
  const [categoryId, setCategoryId] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setPrice(initialData.price.toString());
      setPrepTimeMins(initialData.prepTimeMins.toString());
      setCategoryId(initialData.categoryId);
      setIsVeg(initialData.isVeg);
      setImageUrl(initialData.imageUrl || "");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setPrepTimeMins("20");
      setCategoryId(defaultCategoryId || (categories[0]?.id ?? ""));
      setIsVeg(true);
      setImageUrl("");
    }
    setError(null);
  }, [initialData, defaultCategoryId, categories, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Dish name is required.");
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError("Please provide a valid price.");
      return;
    }
    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: initialData?.id,
        categoryId,
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        prepTimeMins: parseInt(prepTimeMins, 10) || 20,
        isVeg,
        imageUrl: imageUrl.trim() || null,
        isAvailable: initialData?.isAvailable ?? true,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save dish";
      setError(msg);
    }
  };

  const isEdit = Boolean(initialData);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Menu Dish" : "Add New Dish"}</DialogTitle>
        </DialogHeader>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="dish-name">
              Dish Name *
            </label>
            <Input
              id="dish-name"
              placeholder="e.g. Paneer Butter Masala"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dish-category">
                Category *
              </label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="dish-category">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dish-price">
                Price (₹) *
              </label>
              <Input
                id="dish-price"
                type="number"
                min="0"
                step="1"
                placeholder="299"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="dish-desc">
              Description
            </label>
            <textarea
              id="dish-desc"
              className={styles.textarea}
              placeholder="Flavor notes, key ingredients, preparation style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="dish-prep">
                Prep Time (minutes)
              </label>
              <Input
                id="dish-prep"
                type="number"
                min="1"
                max="120"
                placeholder="20"
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="dish-image">
                Image URL (optional)
              </label>
              <Input
                id="dish-image"
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.toggleField}>
            <div className={styles.toggleLabelGroup}>
              <VegTag dietary={isVeg ? "VEG" : "NON_VEG"} />
              <div>
                <div className={styles.toggleTitle}>
                  {isVeg ? "Vegetarian Dish" : "Non-Vegetarian Dish"}
                </div>
                <div className={styles.toggleSubtitle}>
                  Displays corresponding dietary signature badge
                </div>
              </div>
            </div>
            <Switch
              checked={isVeg}
              onCheckedChange={setIsVeg}
              aria-label="Toggle vegetarian dish"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Add Dish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
