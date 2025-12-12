"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const meQuery = trpc.auth.me.useQuery();
  const router = useRouter();
  useAuth({ redirectOnUnauthenticated: true, redirectPath: "/admin" });

  useEffect(() => {
    const user = meQuery.data;
    if (!user) {
      return;
    }
    if (user.role !== "admin") {
      router.push("/admin");
    }
  }, [meQuery.data, router]);

  if (!meQuery.data || meQuery.data.role !== "admin") {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
