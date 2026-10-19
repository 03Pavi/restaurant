"use client";

import { FC, ReactNode } from "react";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { OrderSidebar } from "@/components/customer/order-sidebar";
import { CartDrawer } from "@/components/customer/cart-drawer";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import styles from "./customer-shell.module.scss";

export interface CustomerShellProps {
  children: ReactNode;
}

export const CustomerShell: FC<CustomerShellProps> = ({ children }) => {
  const { data: sessionData } = useSessionQuery();
  const isOwner = sessionData?.user?.role === "RESTAURANT_OWNER";

  return (
    <div className={styles.layoutContainer}>
      {/* Left Navigation Sidebar */}
      <CustomerSidebar />

      {/* Main Content Feed */}
      <div className={`${styles.centerArea} ${isOwner ? styles.centerAreaAdmin : ""}`}>
        {children}
      </div>

      {/* Right Order Menu Panel (Desktop) - Hidden for Restaurant Owner */}
      {!isOwner && <OrderSidebar />}

      {/* Mobile / Tablet Slide-out Drawer - Hidden for Restaurant Owner */}
      {!isOwner && <CartDrawer />}
    </div>
  );
};

