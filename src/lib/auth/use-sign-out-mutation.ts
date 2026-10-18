"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth as fbAuth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await firebaseSignOut(fbAuth);
      } catch (err) {
        // Safe to ignore if not signed in with Firebase
      }

      try {
        await nextAuthSignOut({ redirect: false });
      } catch (err) {
        // Safe to ignore if not signed in with NextAuth
      }

      try {
        await fetch("/api/auth/session-cookie", { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete session cookie:", err);
      }
    },
    onSuccess: async () => {
      queryClient.setQueryData(["session"], {
        user: null,
        isAuthenticated: false,
      });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.refresh();
      router.push("/login");
    },
  });
}
