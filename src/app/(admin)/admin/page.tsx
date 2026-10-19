import { Suspense } from "react";
import { AdminHome } from "@/components/admin/admin-home";

export default function AdminRootPage() {
  return (
    <Suspense fallback={null}>
      <AdminHome />
    </Suspense>
  );
}
