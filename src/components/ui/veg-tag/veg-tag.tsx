import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./veg-tag.module.scss";

export interface VegTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dietary: "VEG" | "NON_VEG";
}

export function VegTag({ dietary, className, ...props }: VegTagProps) {
  const isVeg = dietary === "VEG";

  return (
    <div
      className={cn(styles.wrapper, isVeg ? styles.veg : styles.nonVeg, className)}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
      {...props}
    >
      {isVeg ? (
        <div className={styles.vegDot} />
      ) : (
        <div className={styles.nonVegTriangle} />
      )}
    </div>
  );
}
