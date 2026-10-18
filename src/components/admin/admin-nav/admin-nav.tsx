"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./admin-nav.module.scss";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/orders",
      label: "Kitchen Kanban",
      icon: ShoppingBag,
      active: pathname === "/admin/orders",
    },
    {
      href: "/admin/menu",
      label: "Menu Management",
      icon: UtensilsCrossed,
      active: pathname === "/admin/menu",
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
