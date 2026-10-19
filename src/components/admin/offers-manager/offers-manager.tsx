"use client";

import { FC, useState } from "react";
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
import styles from "./offers-manager.module.scss";

export interface CouponItem {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  timesRedeemed: number;
  totalSaved: number;
  description: string;
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "c1",
    code: "DIRECT20",
    discountType: "PERCENT",
    discountValue: 20,
    minOrderValue: 299,
    maxDiscount: 150,
    expiryDate: "2026-12-31",
    isActive: true,
    timesRedeemed: 64,
    totalSaved: 3840,
    description: "20% off direct online ordering. Beat aggregator commissions!",
  },
  {
    id: "c2",
    code: "WELCOME50",
    discountType: "FLAT",
    discountValue: 50,
    minOrderValue: 199,
    expiryDate: "2026-11-30",
    isActive: true,
    timesRedeemed: 42,
    totalSaved: 2100,
    description: "Flat ₹50 welcome delight for first-time direct patrons.",
  },
  {
    id: "c3",
    code: "FREEDEL",
    discountType: "FLAT",
    discountValue: 40,
    minOrderValue: 399,
    expiryDate: "2026-10-31",
    isActive: true,
    timesRedeemed: 28,
    totalSaved: 1120,
    description: "Free express delivery waiver on orders above ₹399.",
  },
  {
    id: "c4",
    code: "FEAST100",
    discountType: "FLAT",
    discountValue: 100,
    minOrderValue: 799,
    expiryDate: "2026-12-15",
    isActive: false,
    timesRedeemed: 15,
    totalSaved: 1500,
    description: "Big family feast saving on premium party platters.",
  },
];

export const OffersManager: FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Coupon Form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newValue, setNewValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("249");
  const [newMaxDiscount, setNewMaxDiscount] = useState("100");
  const [newExpiry, setNewExpiry] = useState("2026-12-31");
  const [newDescription, setNewDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
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

    const created: CouponItem = {
      id: `c_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discountType: newType,
      discountValue: val,
      minOrderValue: parseFloat(newMinOrder) || 0,
      maxDiscount: newType === "PERCENT" ? parseFloat(newMaxDiscount) || undefined : undefined,
      expiryDate: newExpiry,
      isActive: true,
      timesRedeemed: 0,
      totalSaved: 0,
      description: newDescription.trim() || `${val}${newType === "PERCENT" ? "%" : "₹"} promotional offer`,
    };

    setCoupons([created, ...coupons]);
    setIsModalOpen(false);
    // Reset
    setNewCode("");
    setNewValue("");
    setNewDescription("");
    setFormError(null);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.timesRedeemed, 0);
  const totalSavings = coupons.reduce((sum, c) => sum + c.totalSaved, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.badge}>
            <Tag size={16} />
            <span>Direct Order Boosters</span>
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
                  <span className={styles.redemptionCount}>{coupon.timesRedeemed} redemptions</span>
                  <span className={styles.savedAmount}>₹{coupon.totalSaved} saved</span>
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
