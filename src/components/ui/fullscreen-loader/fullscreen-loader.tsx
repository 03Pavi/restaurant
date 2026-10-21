"use client";

import { FC } from "react";
import { UtensilsCrossed } from "lucide-react";
import styles from "./fullscreen-loader.module.scss";

export interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader: FC<FullScreenLoaderProps> = ({
  message = "Loading dining experience...",
}) => {
  return (
    <div className={styles.container} role="status" aria-live="polite" aria-label="Loading application">
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <div className={styles.logoAura} />
          <div className={styles.logoBox}>
            <UtensilsCrossed size={32} strokeWidth={2.2} />
          </div>
        </div>

        <div className={styles.brandText}>
          <h1 className={styles.brandName}>DineDirect</h1>
          <p className={styles.subtitle}>{message}</p>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
        </div>
      </div>
    </div>
  );
};
