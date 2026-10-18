"use client";

import * as React from "react";
import { Utensils, LogOut, Loader2 } from "lucide-react";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { useSignOutMutation } from "@/lib/auth/use-sign-out-mutation";
import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/admin/admin-nav";
import styles from "./admin-shell.module.scss";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { data: sessionData } = useSessionQuery();
  const signOutMutation = useSignOutMutation();

  const userName = sessionData?.user?.name || "Restaurant Owner";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Utensils size={20} />
          <span>DineDirect</span>
          <span className={styles.brandBadge}>Admin</span>
        </div>

        <div className={styles.sidebarContent}>
          <AdminNav />
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar}>{userInitial}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>Restaurant Owner</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
          >
            {signOutMutation.isPending ? (
              <Loader2 size={14} className={styles.spinIcon} />
            ) : (
              <LogOut size={14} />
            )}
            <span>{signOutMutation.isPending ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </aside>

      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>Restaurant Command Center</div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
