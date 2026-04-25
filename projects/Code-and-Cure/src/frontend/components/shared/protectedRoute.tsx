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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      window.location.href = "/";
      return;
    }

    if (user.role !== role) {
      window.location.href = "/";
    }
  }, [user, role]);

  if (!user || user.role !== role) return null;

  return <>{children}</>;
}