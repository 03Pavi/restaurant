"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
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
