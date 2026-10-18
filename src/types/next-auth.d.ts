import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "RESTAURANT_OWNER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "RESTAURANT_OWNER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "RESTAURANT_OWNER";
  }
}
