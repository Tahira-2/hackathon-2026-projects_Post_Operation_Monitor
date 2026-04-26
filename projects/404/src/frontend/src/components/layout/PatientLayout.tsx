import { NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  CheckSquare,
  Home,
  LogOut,
  MessageCircle,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";

export default function PatientLayout() {
  const { user, signOut } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "Patient";

  const navItems = [
    { to: "/patient/home", icon: Home, label: "Today" },
    { to: "/patient/tasks", icon: CheckSquare, label: "Care Tasks" },
    { to: "/patient/medications", icon: Pill, label: "Medications" },
    { to: "/patient/appointments", icon: Calendar, label: "Visits" },
  ];

  return (
    <div className="patient-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px]">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col px-6 pb-6 pt-6">
          <div className="patient-surface rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-600)] text-lg font-semibold text-white">
                {user?.fullName?.charAt(0) || "P"}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Care Plan
                </p>
                <h2 className="text-base font-semibold text-gray-900 truncate">
                  {user?.fullName || "Patient"}
                </h2>
                <p className="text-sm text-gray-500">Active and on track</p>
              </div>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-[var(--color-primary-700)] shadow-sm border border-gray-100"
                      : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-3">
            <div className="patient-surface rounded-2xl p-4 text-sm text-gray-600">
              <div className="flex items-center gap-2 text-gray-900 font-semibold mb-1">
                <ShieldCheck size={16} className="text-emerald-600" />
                Trusted Care Team
              </div>
              Message your care team any time for guidance, refills, or
              follow-ups.
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full justify-start text-[var(--color-primary-700)]"
                as="a"
                href="/patient/tasks"
              >
                <MessageCircle size={16} />
                Send a message
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={signOut}
            >
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10">
            <div className="patient-surface flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-600)] text-base font-semibold text-white">
                  {user?.fullName?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    CareFlow
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    Welcome back, {firstName}
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href="/patient/appointments"
                >
                  Schedule visit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700"
                  as="a"
                  href="/patient/tasks"
                >
                  Message team
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={signOut}
                >
                  <LogOut size={16} />
                  Sign out
                </Button>
              </div>
              <button onClick={signOut} className="sm:hidden text-gray-600">
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="patient-surface fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 lg:hidden">
        <div className="mx-auto flex max-w-[520px] items-center justify-between px-4 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
                  isActive
                    ? "text-[var(--color-primary-700)]"
                    : "text-gray-500 hover:text-gray-800"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
