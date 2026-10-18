"use client";

import { Toaster as Sonner } from "sonner";
import styles from "./sonner.module.scss";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className={styles.toaster}
      toastOptions={{
        className: styles.toast,
      }}
      {...props}
    />
  );
};

export { Toaster };
