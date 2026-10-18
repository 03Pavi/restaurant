"use client";

import { FC } from "react";
import { Truck, Tag } from "lucide-react";
import styles from "./hero-banner.module.scss";

export const HeroBanner: FC = () => {
  return (
    <section className={styles.heroSection} aria-label="Restaurant Direct Announcement">
      <div className={styles.banner}>
        <div className={styles.content}>
          <div className={styles.headingGroup}>
            <h1 className={styles.headingPrimary}>Hot Food. Zero Fees.</h1>
            <span className={styles.headingSecondary}>
              Order Direct, Cut the Middleman.
            </span>
          </div>

          <p className={styles.subtitle}>
            Tired of hidden fees, cold meals, and long delays? Get piping-hot
            dishes delivered straight from our kitchen to your door.
          </p>

          <div className={styles.featuresRow}>
            {/* Direct Express Delivery Card */}
            <div className={`${styles.featureCard} ${styles.featureCardActive}`}>
              <div className={`${styles.featureIconBox} ${styles.iconOrange}`}>
                <Truck size={20} strokeWidth={2.2} />
              </div>
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>Direct Express Delivery</span>
                <span className={styles.featureSubtitle}>Piping hot &amp; zero markups</span>
              </div>
            </div>

            {/* Discounts & Coupons Card */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconBox} ${styles.iconDark}`}>
                <Tag size={19} strokeWidth={2.2} />
              </div>
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>Discounts &amp; Coupons</span>
                <span className={styles.featureSubtitle}>Save big with direct deals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
