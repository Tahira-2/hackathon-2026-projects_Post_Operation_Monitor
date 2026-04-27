import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Devcare-logo.png";
import ProfileSettingsDrawer from "./ProfileSettingsDrawer";
import { getCurrentProfile } from "../api/authApi";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquareMore,
  UserPlus,
  LogOut,
  ChevronRight,
  BookOpen,
  CalendarDays,
  Activity,
  Settings2,
  UserCircle2,
} from "lucide-react";

const ACCESS_TOKEN_KEY = "devcare_access_token";
const ROLE_KEY = "devcare_role";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem(ROLE_KEY);
  const username = localStorage.getItem("devcare_username");
  const storedAvatarUrl = localStorage.getItem('devcare_avatar_url') || '';
  const [profile, setProfile] = useState({
    username: username || 'User',
    role: role || 'patient',
    avatar_url: storedAvatarUrl,
  });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profileData = await getCurrentProfile();
        if (!active) return;

        setProfile(profileData);
        if (profileData.username) {
          localStorage.setItem('devcare_username', profileData.username);
        }
        if (profileData.avatar_url) {
          localStorage.setItem('devcare_avatar_url', profileData.avatar_url);
        }
      } catch {
        if (!active) return;
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    // Clear all devcare related localStorage items
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("devcare_")) {
        localStorage.removeItem(key);
      }
    });
    // Use window.location.href for a full reload to clear any React/memory state
    window.location.href = "/";
  };

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile?.avatar_url) {
      localStorage.setItem('devcare_avatar_url', updatedProfile.avatar_url);
    }
  };

  const doctorLinks = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
    { label: "Patient List", href: "/doctor/patients", icon: Users },
    { label: "Assign Therapy", href: "/doctor/assign", icon: ClipboardList },
    { label: "Connect Patient", href: "/doctor/share", icon: UserPlus },
  ];

  const patientLinks = [
    { label: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { label: "Sessions", href: "/my-sessions", icon: CalendarDays },
    { label: "Session Result", href: "/session-result", icon: BookOpen },
    { label: "Progress & History", href: "/progress", icon: Activity },
  ];

  const navLinks = role === "doctor" ? doctorLinks : patientLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 border-r border-[var(--color-border)] bg-white p-6 flex flex-col z-50">
      <div className="mb-12 px-2 flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="DevCare Logo" className="h-9 w-auto" />
        </Link>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto">
        <section>
          <nav className="space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-4 py-4 text-base font-medium transition-all ${isActive
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[var(--color-secondary)]"
                  }`
                }
              >
                {({ isActive: linkIsActive }) => (
                  <>
                    <div className="flex items-center gap-4">
                      <link.icon
                        size={22}
                        strokeWidth={linkIsActive ? 2.5 : 2}
                        className="transition-transform group-hover:scale-110"
                      />
                      <span className="tracking-tight">{link.label}</span>
                    </div>
                    {linkIsActive && (
                      <ChevronRight size={16} className="opacity-50" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </section>
      </div>

      <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-4 rounded-3xl px-3 py-3 text-left transition hover:bg-slate-50"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[var(--color-primary-soft)] flex items-center justify-center shadow-sm ring-2 ring-white transition-transform group-hover:scale-105">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <UserCircle2 size={28} className="text-[var(--color-primary)]" />
            )}
          </div>
          <div className="overflow-hidden flex-1 leading-tight">
            <p className="text-sm font-semibold text-[var(--color-secondary)] truncate">
              {profile.username || username || "User"}
            </p>
            <p className="mt-1 text-[10px] font-bold text-[var(--color-text-light)] uppercase tracking-wider">
              {profile.role || role}
            </p>
          </div>
          <Settings2 size={16} className="text-[var(--color-text-light)]" />
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:gap-4"
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Sign Out</span>
        </button>
      </div>

      <ProfileSettingsDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </aside>
  );
}

export default Sidebar;
