"use client";

import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useEffect } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: "patient" | "doctor";
}) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== role) {
      window.location.href = "/";
    }
  }, [user, role, loading]);

  if (loading) return null;
  if (!user || user.role !== role) return null;

  return <>{children}</>;
}