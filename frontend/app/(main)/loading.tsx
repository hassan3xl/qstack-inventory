"use client";

import { usePathname } from "next/navigation";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { FinanceSkeleton } from "@/components/skeletons/FinanceSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";

export default function Loading() {
  const pathname = usePathname() || "";

  if (pathname.includes("/dashboard")) {
    return <DashboardSkeleton />;
  }
  
  if (pathname.includes("/finance")) {
    return <FinanceSkeleton />;
  }

  if (
    pathname.includes("/products") ||
    pathname.includes("/categories") ||
    pathname.includes("/customers") ||
    pathname.includes("/staff")
  ) {
    return <TableSkeleton />;
  }

  return <PageSkeleton />;
}
