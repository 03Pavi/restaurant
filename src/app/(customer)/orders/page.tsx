import { FC } from "react";
import { Clock } from "lucide-react";
import styles from "./page.module.scss";

const CustomerOrdersPage: FC = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your Orders</h1>
      <div className={styles.emptyCard}>
        <Clock size={48} />
        <h2>Order Tracking</h2>
        <p>Live status updates for your table and takeaway orders will appear here.</p>
      </div>
    </div>
  );
};

export default CustomerOrdersPage;
