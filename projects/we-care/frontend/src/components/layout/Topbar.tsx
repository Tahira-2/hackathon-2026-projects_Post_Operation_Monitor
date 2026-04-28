import { LogOut } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSignOutMutation } from "../../lib/auth-hooks";
import { normalizeReferralViewType } from "../../lib/referral-view";

interface NavTab {
  label: string;
  type: string;
}

const NAV_TABS: NavTab[] = [
  { label: "Inbound", type: "inbound" },
  { label: "Outbound", type: "outbound" },
];

export function Topbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const signOutMutation = useSignOutMutation()

  const activeType = normalizeReferralViewType(searchParams.get("type"));
  const showReferralTabs = pathname === "/" || pathname === "/referrals";

  function handleTabClick(type: string) {
    const nextPath = pathname === "/referrals" ? "/referrals" : "/";
    navigate(`${nextPath}?type=${type}`);
  }

  async function handleLogout() {
    try {
      await signOutMutation.mutateAsync();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const isActive = (type: string) =>
    showReferralTabs && activeType === type;

  return (
    <header className="flex items-center gap-4 border-b border-border bg-surface px-6 py-3">
      {showReferralTabs ? (
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
      ) : null}

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
