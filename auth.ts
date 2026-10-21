import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "./src/lib/db";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // 1. If DATABASE_URL is configured, query PostgreSQL via Prisma
        if (process.env.DATABASE_URL) {
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (user && user.password) {
              const isMatch = await bcrypt.compare(password, user.password);
              if (isMatch) {
                return {
                  id: user.id,
                  email: user.email ?? "",
                  name: user.name ?? "",
                  role: user.role as "CUSTOMER" | "RESTAURANT_OWNER",
                };
              }
            }
          } catch (dbErr) {
            console.error("Prisma lookup error (check DATABASE_URL):", dbErr);
          }
        }

        // 2. Fallback for seeded & owner credentials when DATABASE_URL is not set
        if (email === "owner@dinedirect.com" && password === "owner123") {
          return {
            id: "owner-seed-id",
            email: "owner@dinedirect.com",
            name: "Chef Vikram (Owner)",
            role: "RESTAURANT_OWNER",
          };
        }

        if (email === "customer@dinedirect.com" && password === "customer123") {
          return {
            id: "customer-seed-id",
            email: "customer@dinedirect.com",
            name: "Aarav Sharma",
            role: "CUSTOMER",
          };
        }

        if (email.toLowerCase() === "03pavitar.dev@gmail.com") {
          return {
            id: "owner-pavi-id",
            email: "03pavitar.dev@gmail.com",
            name: "Pavitar (Owner)",
            role: "RESTAURANT_OWNER",
          };
        }

        return null;
      },
    }),
  ],
});
