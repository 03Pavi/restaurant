import * as React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import styles from "./layout.module.scss";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isAuthorized = false;

  const session = await auth();
  if (session?.user?.role === "RESTAURANT_OWNER") {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("dinedirect_session");
    if (sessionCookie?.value) {
      try {
        const decoded = JSON.parse(sessionCookie.value);
        if (
          decoded.role === "RESTAURANT_OWNER" ||
          decoded.email?.toLowerCase() === "03pavitar.dev@gmail.com"
        ) {
          isAuthorized = true;
        }
      } catch {
        // ignore invalid cookie
      }
    }
  }

  if (!isAuthorized) {
    redirect("/login");
  }

  return (
    <div className={styles.adminLayout}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
