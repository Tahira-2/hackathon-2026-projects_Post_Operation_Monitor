import { Link, useNavigate, useLocation } from "react-router-dom"
import { Activity, Bell, User, LogOut, Menu, X } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { NotificationPopover } from "./NotificationPopover"
import type { RootState } from "@/store"
import { useLogoutMutation } from "@/apis/auth"
import { logoutUserAction } from "@/store/features/authSlice"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NavItem {
  name: string
  path: string
}

interface HeaderProps {
  role?: string
  navItems?: NavItem[]
  transparent?: boolean
}

export function Header({ role, navItems: navItemsProp, transparent = false }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth)
  const [logoutApi] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch (e) {}
    dispatch(logoutUserAction())
    navigate("/")
  }

  const toggleSidebar = () => {
    document.dispatchEvent(new Event("toggleSidebar"))
  }

  const defaultPublicNavItems = [
    { name: "Home", path: "/" },
    { name: "Solutions", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ]

  const roleNavItems: Record<string, NavItem[]> = {
    patient: [
      { name: "Overview", path: "/patient" },
      { name: "Care Team", path: "/patient/care-team" },
      { name: "Records", path: "/patient/records" },
    ],
    physician: [
      { name: "Dashboard", path: "/physician" },
      { name: "Patients", path: "/physician/patients" },
      { name: "Schedule", path: "/physician/schedule" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin" },
      { name: "Users", path: "/admin/users" },
      { name: "Analytics", path: "/admin/analytics" },
    ],
  }

  const activeNavItems = navItemsProp || 
    (user?.role ? roleNavItems[user.role.toLowerCase()] : defaultPublicNavItems) || 
    defaultPublicNavItems

  const isTransparentActive = transparent && !isScrolled

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isTransparentActive 
          ? "bg-transparent border-transparent text-white" 
          : "bg-white/80 border-b border-emerald-900/10 backdrop-blur-md text-slate-900"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-10">
        <div className="flex items-center gap-4">
          {!user && (
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link 
            to={user ? (user.role?.toLowerCase() === 'doctor' ? '/physician' : `/${user.role?.toLowerCase() || 'patient'}`) : "/"} 
            className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          >
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
              isTransparentActive ? "bg-white/10 border border-white/20" : "bg-emerald-50 border border-emerald-100"
            )}>
              <Activity className={cn("h-5 w-5", isTransparentActive ? "text-white" : "text-emerald-600")} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              HealthCore 
              {role && <span className={cn("ml-2 font-medium hidden md:inline opacity-60")}>| {role}</span>}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-muted/20 p-1 rounded-full border border-border/50">
          {activeNavItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
                  isActive
                    ? (isTransparentActive ? "bg-white text-emerald-900" : "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20")
                    : (isTransparentActive ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50")
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-3">
              <Link to="/patient/login" className={cn("text-sm font-semibold transition-colors", isTransparentActive ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-emerald-700")}>
                Log in
              </Link>
              <Button asChild className={cn("h-10 rounded-xl px-5", isTransparentActive ? "bg-white text-emerald-900 hover:bg-white/90" : "bg-emerald-600 text-white hover:bg-emerald-700")}>
                <Link to="/patient/signup">Get Started</Link>
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NotificationPopover isTransparentActive={isTransparentActive} />

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className={cn(
                    "flex items-center gap-2 rounded-full cursor-pointer pl-2 pr-3 py-1.5 border transition-all",
                    isTransparentActive 
                      ? "border-white/20 bg-white/10 hover:bg-white/20 text-white" 
                      : "border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-slate-900"
                  )}>
                    <div className={cn("p-1 rounded-full", isTransparentActive ? "bg-white/20" : "bg-emerald-600/10")}>
                      <User className={cn("h-4 w-4", isTransparentActive ? "text-white" : "text-emerald-600")} />
                    </div>
                    <span className="text-sm font-semibold max-w-[120px] truncate max-md:hidden">
                      {user.email?.split('@')[0] || "Profile"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-emerald-900/10 shadow-xl shadow-emerald-900/5">
                  <DropdownMenuLabel className="font-bold text-slate-900">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-emerald-900/5" />
                  <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-xl focus:bg-emerald-50 focus:text-emerald-700">
                    <Link to={`/${user.role?.toLowerCase() === 'doctor' ? 'physician' : (user.role?.toLowerCase() || 'patient')}/profile`}>
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-emerald-900/5" />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2 cursor-pointer rounded-xl focus:bg-destructive/5 focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("md:hidden", isTransparentActive ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-emerald-50")} 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-emerald-900/10 p-4 flex flex-col gap-2 md:hidden z-50 animate-in slide-in-from-top-2">
          {activeNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-semibold p-3 rounded-xl transition-all",
                location.pathname === item.path
                  ? "bg-emerald-50 text-emerald-700"
                  : "hover:bg-emerald-50/50 text-slate-600"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {!user && (
            <>
              <div className="h-px w-full bg-emerald-900/5 my-2"></div>
              <Link to="/patient/login" className="text-sm font-semibold p-3 hover:bg-emerald-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Button asChild className="w-full mt-2 h-11 rounded-xl bg-emerald-600 text-white" onClick={() => setMobileMenuOpen(false)}>
                <Link to="/patient/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
