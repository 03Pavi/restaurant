"use client";

import { FC, ReactNode } from "react";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { OrderSidebar } from "@/components/customer/order-sidebar";
import { CartDrawer } from "@/components/customer/cart-drawer";
import styles from "./customer-shell.module.scss";

export interface CustomerShellProps {
  children: ReactNode;
}

export const CustomerShell: FC<CustomerShellProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      {/* Left Navigation Sidebar */}
      <CustomerSidebar />

      {/* Main Content Feed */}
      <div className={styles.centerArea}>
        {children}
      </div>

      {/* Right Order Menu Panel (Desktop) */}
      <OrderSidebar />

      {/* Mobile / Tablet Slide-out Drawer */}
      <CartDrawer />
    </div>
  );
};
