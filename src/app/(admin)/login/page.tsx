"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Lock, Mail, AlertCircle } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth as fbAuth, db, googleProvider } from "@/lib/firebase/client";
import { useSignInMutation } from "@/lib/auth/use-sign-in-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const signInMutation = useSignInMutation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // 1. Google Sign-In via Firebase
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError(null);

      const result = await signInWithPopup(fbAuth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email found with this Google account.");
      }

      const isOwner = user.email.toLowerCase() === "03pavitar.dev@gmail.com";

      let effectiveUserId = user.uid;
      let role = isOwner ? "RESTAURANT_OWNER" : "CUSTOMER";
      let displayName = user.displayName || user.email.split("@")[0];

      // 1. Save or sync user in Supabase "users" table (reuses existing user)
      try {
        const profileRes = await fetch("/api/user/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.uid,
            email: user.email,
            name: displayName,
            role,
            photoURL: user.photoURL,
          }),
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData?.user?.id) {
            effectiveUserId = profileData.user.id;
          }
          if (profileData?.user?.role) {
            role = profileData.user.role;
          }
          if (profileData?.user?.name) {
            displayName = profileData.user.name;
          }
        }
      } catch (err) {
        console.warn("Supabase user sync error:", err);
      }

      // 2. Also sync to Firestore "users" collection if Firestore is enabled
      try {
        const userRef = doc(db, "users", effectiveUserId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data()?.role) {
          role = userSnap.data().role;
        }

        await setDoc(
          userRef,
          {
            uid: effectiveUserId,
            email: user.email,
            name: displayName,
            photoURL: user.photoURL,
            role,
            updatedAt: serverTimestamp(),
            ...(userSnap.exists() ? {} : { createdAt: serverTimestamp() }),
          },
          { merge: true }
        );
      } catch (fbErr) {
        console.warn("Firestore collection sync skipped:", fbErr);
      }

      // Establish session cookie for Next.js server & client (reusing existing user ID)
      const res = await fetch("/api/auth/session-cookie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: effectiveUserId,
          email: user.email,
          name: displayName,
          role,
          photoURL: user.photoURL,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to set session cookie.");
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.refresh();

      // Redirect restaurant owner to admin studio, customers to profile or home
      if (role === "RESTAURANT_OWNER") {
        router.push("/admin/menu");
      } else {
        router.push("/profile");
      }
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      const message = err instanceof Error ? err.message : "Failed to sign in with Google.";
      setAuthError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Email & Password Sign-In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthError(null);

    signInMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          if (email.toLowerCase() === "03pavitar.dev@gmail.com") {
            router.push("/admin/menu");
          } else {
            router.push("/profile");
          }
        },
        onError: (err) => {
          setAuthError(err.message || "Invalid email or password.");
        },
      }
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <UtensilsCrossed size={26} />
          </div>
          <h1 className={styles.title}>Welcome to DineDirect</h1>
          <p className={styles.subtitle}>
            Sign in to order food, manage addresses, or access your restaurant operations.
          </p>
        </div>

        {/* Global Error Banner */}
        {(authError || signInMutation.isError) && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={16} />
            <span>{authError || signInMutation.error?.message || "Authentication failed."}</span>
          </div>
        )}

        {/* Primary Action: Sign In With Google (Passwordless) */}
        <div className={styles.googleContainer}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || signInMutation.isPending}
            className={styles.googleButton}
            aria-label="Continue with Google"
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? "Connecting with Google..." : "Continue with Google"}</span>
          </button>
          <span className={styles.googleHint}>Instant 1-Click Sign-In • No Password Needed</span>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or sign in with email</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isGoogleLoading || signInMutation.isPending}
                className={styles.inputWithIcon}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isGoogleLoading || signInMutation.isPending}
                className={styles.inputWithIcon}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isGoogleLoading || signInMutation.isPending}
            className={styles.submitButton}
          >
            <Lock size={16} />
            <span>{signInMutation.isPending ? "Signing in..." : "Sign In with Email"}</span>
          </Button>
        </form>

        {/* Bottom Note */}
        <div className={styles.footer}>
          <span>Works seamlessly for diners and restaurant managers</span>
        </div>
      </div>
    </div>
  );
}
