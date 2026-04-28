import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import type { AuthUser } from "@/types/auth";

export function useAuth() {
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const formattedRole = user?.role?.toLowerCase() as string;

  return {
    user: user as AuthUser | null,
    token,
    isAuthenticated: !!token && !!user,
    role: formattedRole,
    isAdmin: formattedRole === "admin",
    isPhysician: formattedRole === "physician" || formattedRole === "doctor",
    isPatient: formattedRole === "patient",
  };
}
