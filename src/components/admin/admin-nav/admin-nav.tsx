"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  QrCode,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./admin-nav.module.scss";

function AdminNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "menu";

  const links = [
    {
      href: "/admin?tab=menu",
      label: "Menu & Items",
      icon: UtensilsCrossed,
      active: (pathname === "/admin" && currentTab === "menu") || pathname === "/admin/menu",
    },
    {
      href: "/admin?tab=qr",
      label: "QR & Scans",
      icon: QrCode,
      active: pathname === "/admin" && currentTab === "qr",
    },
    {
      href: "/admin?tab=offers",
      label: "Offers & Coupons",
      icon: Tag,
      active: pathname === "/admin" && currentTab === "offers",
    },
    {
      href: "/admin/orders",
      label: "Kitchen Kanban",
      icon: ShoppingBag,
      active: pathname.startsWith("/admin/orders"),
    },
    {
      href: "/admin/dashboard",
      label: "Operations Dashboard",
      icon: LayoutDashboard,
      active: pathname.startsWith("/admin/dashboard"),
    },
  ];

  return (
    <nav className={styles.nav}>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(styles.navLink, link.active && styles.active)}
          >
            <Icon size={18} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNav() {
  return (
    <React.Suspense fallback={null}>
      <AdminNavContent />
    </React.Suspense>
  );
}
