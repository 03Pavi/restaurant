"use client";

import { FC } from "react";
import { MenuManager } from "@/components/admin/menu-manager";
import styles from "./page.module.scss";

const AdminMenuPage: FC = () => {
  return (
    <div className={styles.page}>
      <MenuManager />
    </div>
  );
};

export default AdminMenuPage;
