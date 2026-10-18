import { FC } from "react";
import { CreditCard } from "lucide-react";
import styles from "./page.module.scss";

const CheckoutPage: FC = () => {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>
      <div className={styles.emptyCard}>
        <CreditCard size={48} />
        <h2>Checkout Flow</h2>
        <p>Support for Dine-in, Takeaway, and Delivery will be available here.</p>
      </div>
    </div>
  );
};

export default CheckoutPage;
