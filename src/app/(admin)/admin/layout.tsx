import * as React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import styles from "./layout.module.scss";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "RESTAURANT_OWNER") {
    redirect("/login");
  }

  return (
    <div className={styles.adminLayout}>
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
