import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./not-found.module.scss";

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.description}>The page you are looking for does not exist.</p>
      <Button variant="default" asChild>
        <Link href="/">Return to Menu</Link>
      </Button>
    </div>
  );
}
