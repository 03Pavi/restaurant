export const ROLES = {
  CUSTOMER: "CUSTOMER",
  RESTAURANT_OWNER: "RESTAURANT_OWNER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ORDER_STATUS = {
  PLACED: "PLACED",
  ACCEPTED: "ACCEPTED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const DIETARY_TYPE = {
  VEG: "VEG",
  NON_VEG: "NON_VEG",
} as const;

export type DietaryType = (typeof DIETARY_TYPE)[keyof typeof DIETARY_TYPE];
