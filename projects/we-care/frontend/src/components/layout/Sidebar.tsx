import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Plus,
  User,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeReferralViewType } from "../../lib/referral-view";
import { useProfileStore } from "../../stores/profileStore";
import { Logo } from "../ui/Logo";
import { SidebarNavItem } from "./SidebarNavItem";

interface NavItem {
  to: string | { pathname: string; search?: string };
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fullName, specialty, avatarUrl } = useProfileStore();
  const displayName = fullName || "Doctor";
  const activeType = normalizeReferralViewType(
    new URLSearchParams(location.search).get("type"),
  );
  const referralSearch = `?type=${activeType}`;
  const navItems = useMemo<NavItem[]>(
    () => [
      {
        to: { pathname: "/", search: referralSearch },
        label: "Dashboard",
        icon: LayoutDashboard,
        end: true,
      },
      {
        to: { pathname: "/referrals", search: referralSearch },
        label: "Referrals",
        icon: Users,
      },
      { to: "/specialists", label: "Specialists", icon: UserRound },
      { to: "/profile", label: "Profile", icon: User },
    ],
    [referralSearch],
  );

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-white">
      <div className="flex items-center gap-3 px-5 py-6">
        <Logo size={32} />
        <div>
          <p className="text-sm font-bold leading-tight">RefAI Portal</p>
          <p className="text-xs text-slate-400 leading-tight">
            Medical Specialist
          </p>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => navigate("/referrals/new")}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New Referral
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <SidebarNavItem key={typeof item.to === "string" ? item.to : item.to.pathname} {...item} />
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-accent flex items-center justify-center text-sm font-semibold text-white">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{displayName[0] ?? "U"}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            {specialty && (
              <p className="truncate text-xs text-slate-400">{specialty}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
