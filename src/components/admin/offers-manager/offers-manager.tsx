"use client";

import { FC, useState, useEffect, useMemo } from "react";
import {
  Tag,
  Plus,
  Percent,
  Copy,
  Check,
  Trash2,
  Calendar,
  Sparkles,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  OfferData,
  fetchOffers,
  createOffer,
  updateOfferStatus,
  deleteOffer,
} from "@/lib/firebase/offers-service";
import styles from "./offers-manager.module.scss";

export const OffersManager: FC = () => {
  const [coupons, setCoupons] = useState<OfferData[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Coupon Form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newValue, setNewValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("249");
  const [newMaxDiscount, setNewMaxDiscount] = useState("100");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch from Firestore collection
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchOffers();
        if (mounted && data) {
          setCoupons(data);
        }
      } catch (err) {
        console.warn("Error fetching offers collection:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleToggle = async (id: string) => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return;
    const nextState = !target.isActive;

    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: nextState } : c))
    );

    try {
      await updateOfferStatus(id, nextState);
    } catch (err) {
      console.warn("Failed to update status in collection:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteOffer(id);
    } catch (err) {
      console.warn("Failed to delete offer from collection:", err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setFormError("Coupon code is required");
      return;
    }
    const val = parseFloat(newValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Please enter a valid discount amount");
      return;
    }

    try {
      const created = await createOffer({
        code: newCode,
        discountType: newType,
        discountValue: val,
        minOrderValue: parseFloat(newMinOrder) || 0,
        maxDiscount: newType === "PERCENT" ? parseFloat(newMaxDiscount) || undefined : undefined,
        expiryDate: newExpiry,
        description: newDescription.trim() || undefined,
      });

      setCoupons((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewCode("");
      setNewValue("");
      setNewDescription("");
      setFormError(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create offer.");
    }
  };

  const activeCount = useMemo(() => coupons.filter((c) => c.isActive).length, [coupons]);
  const totalRedemptions = useMemo(() => coupons.reduce((sum, c) => sum + (c.timesRedeemed || 0), 0), [coupons]);
  const totalSavings = useMemo(() => coupons.reduce((sum, c) => sum + (c.totalSaved || 0), 0), [coupons]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.badge}>
            <Tag size={16} />
            <span>Live Firestore Collection: offers</span>
          </div>
          <h2 className={styles.title}>Offers &amp; Promo Coupons</h2>
          <p className={styles.subtitle}>
            Incentivize diners to order direct through DineDirect instead of high-commission delivery apps with attractive discount codes.
          </p>
        </div>

        <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Highlights Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Percent size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Active Promotions</span>
            <span className={styles.statValue}>{activeCount} Live</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <ShoppingBag size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Coupons Redeemed</span>
            <span className={styles.statValue}>{totalRedemptions} Orders</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <IndianRupee size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Customer Savings Delivered</span>
            <span className={styles.statValue}>₹{totalSavings.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <Sparkles size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Aggregator Savings (30% cut)</span>
            <span className={styles.statValue}>₹{(totalSavings * 1.5).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      {isLoading ? (
        <div className={styles.loadingState}>Loading offers collection...</div>
      ) : coupons.length === 0 ? (
        <div className={styles.emptyCoupons}>
          <Tag size={40} />
          <h3>No Promotional Coupons Found</h3>
          <p>Create your first direct ordering offer to boost diner loyalty.</p>
          <Button variant="default" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={15} />
            <span>Create First Coupon</span>
          </Button>
        </div>
      ) : (
        <div className={styles.couponsGrid}>
          {coupons.map((coupon) => {
            const isCopied = copiedId === coupon.id;
            return (
              <div
                key={coupon.id}
                className={`${styles.couponCard} ${!coupon.isActive ? styles.couponCardInactive : ""}`}
              >
                <div className={styles.couponTop}>
                  <div className={styles.codeBadgeGroup}>
                    <div className={styles.codePill}>
                      <span className={styles.codeText}>{coupon.code}</span>
                      <button
                        type="button"
                        className={styles.copyButton}
                        onClick={() => handleCopy(coupon.id, coupon.code)}
                        title="Copy code"
                        aria-label="Copy code"
                      >
                        {isCopied ? <Check size={14} className={styles.checkIcon} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span className={`${styles.statusBadge} ${coupon.isActive ? styles.statusActive : styles.statusPaused}`}>
                      {coupon.isActive ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div className={styles.toggleGroup}>
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={() => handleToggle(coupon.id)}
                      aria-label="Toggle coupon status"
                    />
                  </div>
                </div>

                <div className={styles.couponBody}>
                  <div className={styles.discountAmount}>
                    {coupon.discountType === "PERCENT"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} FLAT OFF`}
                  </div>
                  <p className={styles.couponDescription}>{coupon.description}</p>

                  <div className={styles.rulesList}>
                    <div className={styles.ruleItem}>
                      <span>Min Order:</span>
                      <strong>₹{coupon.minOrderValue}</strong>
                    </div>
                    {coupon.maxDiscount && (
                      <div className={styles.ruleItem}>
                        <span>Max Cap:</span>
                        <strong>₹{coupon.maxDiscount}</strong>
                      </div>
                    )}
                    <div className={styles.ruleItem}>
                      <Calendar size={13} />
                      <span>Valid until {coupon.expiryDate}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.couponFooter}>
                  <div className={styles.redemptionStats}>
                    <span className={styles.redemptionCount}>{coupon.timesRedeemed || 0} redemptions</span>
                    <span className={styles.savedAmount}>₹{coupon.totalSaved || 0} saved</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(coupon.id)}
                    className={styles.deleteButton}
                    title="Delete Coupon"
                    aria-label="Delete Coupon"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Promotional Coupon</DialogTitle>
          </DialogHeader>

          {formError && <div className={styles.formError}>{formError}</div>}

          <form onSubmit={handleCreateCoupon} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="coupon-code" className={styles.fieldLabel}>
                Coupon Promo Code *
              </label>
              <Input
                id="coupon-code"
                placeholder="e.g. TASTY25"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Discount Type</label>
                <div className={styles.typeSelector}>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${newType === "PERCENT" ? styles.typeBtnActive : ""}`}
                    onClick={() => setNewType("PERCENT")}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${newType === "FLAT" ? styles.typeBtnActive : ""}`}
                    onClick={() => setNewType("FLAT")}
                  >
                    Flat Amount (₹)
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="discount-val" className={styles.fieldLabel}>
                  {newType === "PERCENT" ? "Percentage (% Off) *" : "Discount Amount (₹) *"}
                </label>
                <Input
                  id="discount-val"
                  type="number"
                  placeholder={newType === "PERCENT" ? "20" : "50"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="min-order" className={styles.fieldLabel}>
                  Min. Order Value (₹)
                </label>
                <Input
                  id="min-order"
                  type="number"
                  placeholder="249"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(e.target.value)}
                />
              </div>

              {newType === "PERCENT" && (
                <div className={styles.field}>
                  <label htmlFor="max-cap" className={styles.fieldLabel}>
                    Max Discount Cap (₹)
                  </label>
                  <Input
                    id="max-cap"
                    type="number"
                    placeholder="150"
                    value={newMaxDiscount}
                    onChange={(e) => setNewMaxDiscount(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="coupon-desc" className={styles.fieldLabel}>
                Customer Note / Description
              </label>
              <Input
                id="coupon-desc"
                placeholder="e.g. Weekend special delight on tandoori specials"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="expiry-date" className={styles.fieldLabel}>
                Expiry Date
              </label>
              <Input
                id="expiry-date"
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Launch Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
