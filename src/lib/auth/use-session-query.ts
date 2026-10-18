"use client";

import { useQuery } from "@tanstack/react-query";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "RESTAURANT_OWNER";
}

export interface SessionData {
  user: SessionUser | null;
  isAuthenticated: boolean;
}

export function useSessionQuery() {
  const { data, isPending, refetch } = useQuery<SessionData>({
    queryKey: ["session"],
    queryFn: async (): Promise<SessionData> => {
      const res = await fetch("/api/me", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch session");
      }

      return res.json();
    },
    staleTime: 30_000,
  });

  return {
    data,
    isPending,
    refetch,
  };
}
