"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Utensils, Lock } from "lucide-react";
import { useSignInMutation } from "@/lib/auth/use-sign-in-mutation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const signInMutation = useSignInMutation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    signInMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push("/admin/dashboard");
        },
      }
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Utensils size={24} />
          </div>
          <h1 className={styles.title}>Owner Portal</h1>
          <p className={styles.subtitle}>
            Sign in to manage kitchen orders, menu, and restaurant operations
          </p>
        </div>

        {signInMutation.isError && (
          <div className={styles.errorMessage} role="alert">
            {signInMutation.error?.message || "Invalid email or password"}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="owner@dinedirect.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={signInMutation.isPending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={signInMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={signInMutation.isPending}
          >
            <Lock size={16} />
            <span>
              {signInMutation.isPending ? "Signing in..." : "Sign In to Dashboard"}
            </span>
          </Button>
        </form>
{/* 
        <div className={styles.footer}>
          <span>DineDirect Micro-Frontend Platform</span>
        </div> */}
      </div>
    </div>
  );
}
