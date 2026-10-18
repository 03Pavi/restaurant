import { ReactNode } from "react";
import { CustomerShell } from "@/components/customer/customer-shell";
import styles from "./layout.module.scss";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={styles.customerLayout}>
      <CustomerShell>{children}</CustomerShell>
    </div>
  );
}
