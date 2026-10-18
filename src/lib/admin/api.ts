// Admin-only API calls and mutations

export interface AdminDashboardStats {
  todayRevenue: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
  averagePrepTimeMinutes: number;
}

export async function fetchAdminStats(): Promise<AdminDashboardStats> {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch admin stats");
  }
  return res.json();
}
