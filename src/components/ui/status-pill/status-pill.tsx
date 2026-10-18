import * as React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/shared/constants";
import styles from "./status-pill.module.scss";

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  status: OrderStatus | string;
}

export function StatusPill({ status, className, ...props }: StatusPillProps) {
  const statusKey = status.toUpperCase();

  const statusClass = {
    PLACED: styles.placed,
    ACCEPTED: styles.accepted,
    PREPARING: styles.preparing,
    READY: styles.ready,
    OUT_FOR_DELIVERY: styles.outForDelivery,
    DELIVERED: styles.delivered,
    CANCELLED: styles.cancelled,
  }[statusKey] || styles.placed;

  const label = status.replace(/_/g, " ").toLowerCase();

  return (
    <div className={cn(styles.statusPill, statusClass, className)} {...props}>
      <span className={styles.dot} />
      <span>{label}</span>
    </div>
  );
}
