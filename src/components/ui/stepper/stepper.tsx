import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./stepper.module.scss";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function Stepper({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  className,
  ...props
}: StepperProps) {
  return (
    <div className={cn(styles.stepper, className)} {...props}>
      <button
        type="button"
        className={styles.stepButton}
        onClick={onDecrement}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className={styles.count}>{value}</span>
      <button
        type="button"
        className={styles.stepButton}
        onClick={onIncrement}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
