"use client";

import { FC, ReactNode } from "react";
import { CartDrawer } from "@/components/customer/cart-drawer";

export interface CartDrawerProviderProps {
  children: ReactNode;
}

export const CartDrawerProvider: FC<CartDrawerProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
};
