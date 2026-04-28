import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { 
  LayoutDashboard, 
  Users, 
  CalendarHeart, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen, 
  FileStack, 
  Stethoscope, 
  Clock, 
  MessageSquare, 
  Activity,
  LogOut,
  ClipboardList
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/apis/auth"
import { logoutUserAction } from "@/store/features/authSlice"

interface SidebarProps {
  role: "admin" | "physician" | "patient"
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [logoutApi] = useLogoutMutation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev)
    document.addEventListener("toggleSidebar", handleToggle)
    return () => document.removeEventListener("toggleSidebar", handleToggle)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch (e) {}
    dispatch(logoutUserAction())
    navigate("/")
  }

  const navItems = {
    admin: [
      { name: "Specializations", href: "/admin/specializations", icon: Stethoscope },
      { name: "Medicines", href: "/admin/medicines", icon: FileStack },
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Messages", href: "/admin/chat", icon: MessageSquare },
      { name: "Profile", href: "/admin/profile", icon: Settings },
    ],
    physician: [
      { name: "Overview", href: "/physician", icon: LayoutDashboard },
      { name: "Appointments", href: "/physician/appointments", icon: CalendarHeart },
      { name: "Messages", href: "/physician/chat", icon: MessageSquare },
      { name: "Availability", href: "/physician/availability", icon: Clock },
      { name: "Profile", href: "/physician/profile", icon: Settings },
    ],
    patient: [
      { name: "Overview", href: "/patient", icon: LayoutDashboard },
      { name: "Appointments", href: "/patient/appointments", icon: CalendarHeart },
      { name: "Messages", href: "/patient/chat", icon: MessageSquare },
      { name: "Medicines", href: "/patient/medicines", icon: FileStack },
      { name: "Care Plan", href: "/patient/care-plan", icon: ClipboardList },
      { name: "Profile", href: "/patient/profile", icon: Settings },

    ]
  }

  const items = navItems[role]

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "border-r bg-card transition-all duration-300 ease-in-out relative z-[70] flex flex-col h-screen sticky top-0",
        isCollapsed ? "md:w-20" : "md:w-64",
        !mobileOpen ? "max-md:w-16" : "max-md:w-64",
        "flex"
      )}>
        <div className="flex items-center h-16 px-6 border-b shrink-0">
          <Link 
            to={role === 'physician' ? '/physician' : `/${role}`} 
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 transition-colors">
              <Activity className="h-5 w-5 text-emerald-600" />
            </div>
            {!isCollapsed && (window.innerWidth >= 768 || mobileOpen) && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold tracking-tight text-slate-900 truncate leading-none">
                  HealthCore
                </span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1 opacity-80">
                  {role === 'physician' ? 'Physician' : role}
                </span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex md:hidden items-center justify-between p-4 border-b">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-background p-1.5 rounded-full border text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm transition-all"
          >
            {mobileOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-background p-1.5 rounded-full border text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm transition-all z-[80] cursor-pointer hidden md:flex"
        >
          {isCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>

        <div className="flex flex-col flex-1 py-4 pt-6 overflow-y-auto hide-scrollbars overflow-x-hidden">
          <nav className={cn("grid gap-1 mb-6", isCollapsed ? "px-2" : "px-4")}>
            {items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href || (item.href !== `/${role}` && location.pathname.startsWith(item.href + '/'))

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  title={(isCollapsed || (!mobileOpen)) ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg py-2.5 transition-all outline-none cursor-pointer px-3",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className={cn("shrink-0", (isCollapsed || (!mobileOpen)) ? "h-5 w-5" : "h-[18px] w-[18px]")} />
                  {(!isCollapsed && (window.innerWidth >= 768 || mobileOpen)) && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </div >

        <div className={cn("p-4 border-t mt-auto", isCollapsed ? "px-2" : "px-4")}>
          <button
            onClick={handleLogout}
            title={(isCollapsed || (!mobileOpen)) ? "Logout" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg py-2.5 transition-all outline-none cursor-pointer px-3 text-destructive hover:bg-destructive/10"
            )}
          >
            <LogOut className={cn("shrink-0", (isCollapsed || (!mobileOpen)) ? "h-5 w-5" : "h-[18px] w-[18px]")} />
            {(!isCollapsed && (window.innerWidth >= 768 || mobileOpen)) && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside >
    </>
  )
}
