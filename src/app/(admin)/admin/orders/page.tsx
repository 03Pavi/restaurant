import * as React from "react";
import { Utensils } from "lucide-react";
import styles from "./page.module.scss";

export default function AdminOrdersPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Kitchen Kanban Display</h1>
      <div className={styles.emptyCard}>
        <Utensils size={48} />
        <h2>Live Kanban Board</h2>
        <p>Kitchen order tickets (KOT) and live column dispatching will appear here.</p>
      </div>
    </div>
  );
}
