import * as React from "react";
import styles from "./page.module.scss";

export default function AdminDashboardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>
          Real-time operations, daily revenue, and kitchen throughput.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Today&apos;s Revenue</span>
          <span className={styles.statValue}>₹0</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Orders</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Completed Today</span>
          <span className={styles.statValue}>0</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Prep Time</span>
          <span className={styles.statValue}>18m</span>
        </div>
      </div>
    </div>
  );
}
