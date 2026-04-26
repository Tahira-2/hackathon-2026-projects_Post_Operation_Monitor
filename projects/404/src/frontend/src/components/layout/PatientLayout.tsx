import { NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  CheckSquare,
  Home,
  LogOut,
  MessageCircle,
  MessageSquare,
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
    { to: "/patient/messages", icon: MessageSquare, label: "Messages" },
    { to: "/patient/tasks", icon: CheckSquare, label: "Care Tasks" },
    { to: "/patient/medications", icon: Pill, label: "Medications" },
    { to: "/patient/appointments", icon: Calendar, label: "Visits" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex sticky top-0 h-screen overflow-hidden">
        {/* App Logo */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center gap-2 font-extrabold text-xl tracking-tight text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <ShieldCheck size={18} />
          </span>
          CareFlow <span className="text-indigo-600">AI</span>
        </div>

        {/* User Profile Widget */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-100">
              {user?.fullName?.charAt(0) || "P"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-gray-900">
                {user?.fullName || "Patient User"}
              </h2>
              <p className="truncate text-xs font-semibold text-indigo-600">
                Active care plan
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-extrabold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-4 bg-gray-50/50">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs font-medium text-gray-500 leading-relaxed shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              Trusted Care Team
            </div>
            Message your care team any time for guidance, refills, or follow-ups.
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full justify-center text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
              as="a"
              href="/patient/messages"
            >
              <MessageCircle size={14} className="mr-1.5" />
              Send a message
            </Button>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Header - Mobile & Tablet Only */}
        <header className="sticky top-0 z-30 px-4 py-3 bg-white border-b border-gray-200 shadow-sm md:hidden flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
              {user?.fullName?.charAt(0) || "P"}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 line-clamp-1">
                CareFlow AI
              </p>
              <p className="text-sm font-extrabold text-gray-900 truncate">
                Welcome, {firstName}
              </p>
            </div>
          </div>
          <button onClick={signOut} className="text-gray-400 hover:text-red-500 transition-colors p-2">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 pb-24 md:pb-8 relative">
          <div className="max-w-4xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-all ${
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-900"
                }`
              }
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                <item.icon size={20} className={isActive ? 'fill-indigo-100/50' : ''} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
