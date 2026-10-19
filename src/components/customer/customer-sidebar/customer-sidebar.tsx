"use client";

import { FC, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  Home,
  Search,
  ClipboardList,
  User,
  LogOut,
  LogIn,
  ShoppingBag,
  Loader2,
  QrCode,
  Tag,
  LayoutDashboard,
} from "lucide-react";
import { useSessionQuery } from "@/lib/auth/use-session-query";
import { useSignOutMutation } from "@/lib/auth/use-sign-out-mutation";
import { useCartTotalCount, useCartDrawerOpen } from "@/lib/customer/use-cart";
import styles from "./customer-sidebar.module.scss";

const CustomerSidebarContent: FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "menu";

  const { data: sessionData } = useSessionQuery();
  const signOutMutation = useSignOutMutation();
  const totalCount = useCartTotalCount();
  const [, setIsOpen] = useCartDrawerOpen();

  const isAuthenticated = Boolean(sessionData?.isAuthenticated && sessionData?.user);
  const isOwner = sessionData?.user?.role === "RESTAURANT_OWNER";
  const userName = sessionData?.user?.name || sessionData?.user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Navigation Items for Standard Customer
  const customerNavItems = [
    { label: "Home", href: "/", icon: Home, exact: true, requiresAuth: false },
    { label: "Search", href: "/search", icon: Search, exact: true, requiresAuth: false },
    { label: "Orders", href: "/orders", icon: ClipboardList, requiresAuth: true },
    { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
  ];

  // Action Items for Restaurant Owner / Admin
  const adminNavItems = [
    {
      label: "Menu & Items",
      href: "/?tab=menu",
      icon: UtensilsCrossed,
      isActive: (pathname === "/" && (currentTab === "menu" || !currentTab)) || pathname.startsWith("/admin/menu"),
    },
    {
      label: "QR & Scans",
      href: "/?tab=qr",
      icon: QrCode,
      isActive: pathname === "/" && currentTab === "qr",
    },
    {
      label: "Offers & Coupons",
      href: "/?tab=offers",
      icon: Tag,
      isActive: pathname === "/" && currentTab === "offers",
    },
    {
      label: "Kitchen Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/admin/orders") || pathname === "/orders",
    },
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: pathname.startsWith("/admin/dashboard"),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  const visibleCustomerNavItems = customerNavItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Visible on screens >= 1025px) */}
      <aside className={styles.desktopSidebar} aria-label="Main Navigation">
        <div className={styles.topSection}>
          <Link href="/" className={styles.brand}>
            <div className={styles.logoIcon}>
              <UtensilsCrossed size={20} />
            </div>
            <span className={styles.brandName}>DineDirect</span>
            {isOwner && <span className={styles.adminBadge}>Admin</span>}
          </Link>

          {isOwner && (
            <div className={styles.navSectionTitle}>Command Center</div>
          )}

          <nav className={styles.nav}>
            {isOwner
              ? adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`${styles.navLink} ${item.isActive ? styles.navLinkActive : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              : visibleCustomerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== "/";

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
          </nav>
        </div>

        {/* Auth Section: User Name & Logout ONLY when authenticated, otherwise Log In button */}
        {isAuthenticated ? (
          <div className={styles.profileCard}>
            <div className={styles.profileInfo}>
              <div className={styles.avatar}>{userInitial}</div>
              <div className={styles.details}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userRole}>
                  {isOwner ? "Owner" : "Customer"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
              className={`${styles.actionButton} ${signOutMutation.isPending ? styles.actionButtonLoading : ""}`}
              title={signOutMutation.isPending ? "Signing out..." : "Sign Out"}
              aria-label="Sign Out"
            >
              {signOutMutation.isPending ? (
                <Loader2 size={16} className={styles.spinIcon} />
              ) : (
                <LogOut size={16} />
              )}
            </button>
          </div>
        ) : (
          <Link href="/login" className={styles.loginButton} aria-label="Log In">
            <LogIn size={17} />
            <span>Log In</span>
          </Link>
        )}
      </aside>

      {/* 2. MOBILE BOTTOM DOCK (Visible on screens <= 1024px) */}
      <div className={styles.mobileDockWrapper}>
        <nav className={styles.mobileDock} aria-label="Mobile Navigation Dock">
          {isOwner ? (
            <>
              {/* Menu & Items */}
              <Link
                href="/?tab=menu"
                className={`${styles.dockItem} ${
                  pathname === "/" && (currentTab === "menu" || !currentTab) ? styles.dockItemActive : ""
                }`}
              >
                <div className={styles.dockIconWrapper}>
                  <UtensilsCrossed size={19} />
                </div>
                <span className={styles.dockLabel}>Menu</span>
              </Link>

              {/* QR & Scans */}
              <Link
                href="/?tab=qr"
                className={`${styles.dockItem} ${
                  pathname === "/" && currentTab === "qr" ? styles.dockItemActive : ""
                }`}
              >
                <div className={styles.dockIconWrapper}>
                  <QrCode size={19} />
                </div>
                <span className={styles.dockLabel}>QR Codes</span>
              </Link>

              {/* Offers */}
              <Link
                href="/?tab=offers"
                className={`${styles.dockItem} ${
                  pathname === "/" && currentTab === "offers" ? styles.dockItemActive : ""
                }`}
              >
                <div className={styles.dockIconWrapper}>
                  <Tag size={19} />
                </div>
                <span className={styles.dockLabel}>Offers</span>
              </Link>

              {/* Orders */}
              <Link
                href="/admin/orders"
                className={`${styles.dockItem} ${pathname.startsWith("/admin/orders") ? styles.dockItemActive : ""}`}
              >
                <div className={styles.dockIconWrapper}>
                  <ShoppingBag size={19} />
                </div>
                <span className={styles.dockLabel}>Orders</span>
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                className={`${styles.dockItem} ${pathname.startsWith("/profile") ? styles.dockItemActive : ""}`}
              >
                <div className={styles.dockIconWrapper}>
                  <div className={styles.dockAvatar}>{userInitial}</div>
                </div>
                <span className={styles.dockLabel}>Profile</span>
              </Link>
            </>
          ) : (
            <>
              {/* Home */}
              <Link
                href="/"
                className={`${styles.dockItem} ${pathname === "/" ? styles.dockItemActive : ""}`}
              >
                <div className={styles.dockIconWrapper}>
                  <Home size={19} />
                </div>
                <span className={styles.dockLabel}>Home</span>
              </Link>

              {/* Search (Highlighted on /search) */}
              <Link
                href="/search"
                className={`${styles.dockItem} ${pathname === "/search" ? styles.dockItemActive : ""}`}
              >
                <div className={styles.dockIconWrapper}>
                  <Search size={19} />
                </div>
                <span className={styles.dockLabel}>Search</span>
              </Link>

              {/* Cart Trigger */}
              <button
                type="button"
                className={styles.dockItem}
                onClick={() => setIsOpen(true)}
                aria-label={`Open cart with ${totalCount} items`}
              >
                <div className={styles.dockIconWrapper}>
                  <ShoppingBag size={19} />
                  {totalCount > 0 && (
                    <span className={styles.cartBadge}>{totalCount}</span>
                  )}
                </div>
                <span className={styles.dockLabel}>Cart</span>
              </button>

              {/* Orders: only when authenticated */}
              {isAuthenticated && (
                <Link
                  href="/orders"
                  className={`${styles.dockItem} ${pathname.startsWith("/orders") ? styles.dockItemActive : ""}`}
                >
                  <div className={styles.dockIconWrapper}>
                    <ClipboardList size={19} />
                  </div>
                  <span className={styles.dockLabel}>Orders</span>
                </Link>
              )}

              {/* Profile / Log In */}
              <Link
                href={isAuthenticated ? "/profile" : "/login"}
                className={`${styles.dockItem} ${
                  pathname.startsWith("/login") || pathname.startsWith("/profile")
                    ? styles.dockItemActive
                    : ""
                }`}
              >
                <div className={styles.dockIconWrapper}>
                  {isAuthenticated ? (
                    <div className={styles.dockAvatar}>{userInitial}</div>
                  ) : (
                    <LogIn size={19} />
                  )}
                </div>
                <span className={styles.dockLabel}>
                  {isAuthenticated ? "Profile" : "Log In"}
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export const CustomerSidebar: FC = () => {
  return (
    <Suspense fallback={null}>
      <CustomerSidebarContent />
    </Suspense>
  );
};
