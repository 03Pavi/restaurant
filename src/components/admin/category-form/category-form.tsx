"use client";

import { useState, FC, FormEvent } from "react";
import { useSaveCategoryMutation } from "@/lib/admin/use-menu-management";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./category-form.module.scss";

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextSortOrder?: number;
}

export const CategoryFormModal: FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  nextSortOrder = 0,
}) => {
  const saveCategoryMutation = useSaveCategoryMutation();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      await saveCategoryMutation.mutateAsync({
        name: name.trim(),
        sortOrder: nextSortOrder,
      });
      setName("");
      setError(null);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create category";
      setError(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Category</DialogTitle>
        </DialogHeader>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="cat-name">
              Category Title *
            </label>
            <Input
              id="cat-name"
              placeholder="e.g. Clay Oven Tandoori"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saveCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={saveCategoryMutation.isPending}
            >
              {saveCategoryMutation.isPending ? "Adding..." : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
