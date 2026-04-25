import { LogOut } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface NavTab {
  label: string;
  type: string;
}

const NAV_TABS: NavTab[] = [
  { label: "Inbound", type: "inbound" },
  { label: "Outbound", type: "outbound" },
  { label: "Pending", type: "pending" },
];

export function Topbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const activeType = searchParams.get("type");

  function handleTabClick(type: string) {
    navigate(`/referrals?type=${type}`);
  }

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  const isActive = (type: string) =>
    pathname === "/referrals" && activeType === type;

  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface px-6 py-3">
      <nav className="flex items-center gap-1 text-sm font-medium">
        {NAV_TABS.map(({ label, type }) => (
          <button
            key={type}
            onClick={() => handleTabClick(type)}
            className={[
              "rounded px-3 py-1.5 transition-colors",
              isActive(type)
                ? "text-accent font-semibold"
                : "text-muted hover:text-primary",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex h-9 gap-2 align-middle items-center justify-center rounded-lg text-muted hover:bg-base hover:text-primary transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
