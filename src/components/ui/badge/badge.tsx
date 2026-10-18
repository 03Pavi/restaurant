import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./badge.module.scss";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "subtle" | "outline" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = {
    default: styles.variantDefault,
    secondary: styles.variantSecondary,
    subtle: styles.variantSubtle,
    outline: styles.variantOutline,
    destructive: styles.variantDestructive,
  }[variant];

  return <div className={cn(styles.badge, variantClass, className)} {...props} />;
}

export { Badge };
