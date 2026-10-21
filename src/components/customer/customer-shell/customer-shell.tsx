"use client";

import { FC, ReactNode, Suspense } from "react";
import { CustomerSidebar } from "@/components/customer/customer-sidebar";
import { OrderSidebar } from "@/components/customer/order-sidebar";
import { CartDrawer } from "@/components/customer/cart-drawer";
import { ScratchCardModal } from "@/components/customer/scratch-card-modal";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import styles from "./customer-shell.module.scss";

export interface CustomerShellProps {
  children: ReactNode;
}

export const CustomerShell: FC<CustomerShellProps> = ({ children }) => {
  const { data: sessionData, isPending } = useSessionQuery();
  const isOwner = sessionData?.user?.role === "RESTAURANT_OWNER";

  // Show full-screen loading until /me session data is fetched
  if (isPending) {
    return <FullScreenLoader />;
  }

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

      {/* Interactive Scratch Card Modal triggered by QR scan */}
      {!isOwner && (
        <Suspense fallback={null}>
          <ScratchCardModal />
        </Suspense>
      )}
    </div>
  );
};

