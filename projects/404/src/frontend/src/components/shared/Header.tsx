import { Link, useNavigate, useLocation } from "react-router-dom"
import { Activity, Bell, User, LogOut, Menu, X } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { useState } from "react"
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

type HeaderNavItem = {
  name: string
  path: string
}

export function Header({ navItems }: { navItems?: HeaderNavItem[] }) {
  const { user } = useSelector((state: RootState) => state.auth)
  const [logoutApi] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const showSidebarToggle = Boolean(user && user.role?.toLowerCase() !== "patient")
  const showCenteredNav = Boolean(navItems?.length)

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap()
    } catch {
      // Best effort network request, force client to clear states anyway
    }
    dispatch(logoutUserAction())
    navigate("/")
  }

  const toggleSidebar = () => {
    document.dispatchEvent(new Event("toggleSidebar"))
  }

  const defaultNavItems = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ]

  const topNavItems = navItems ?? defaultNavItems

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          {showSidebarToggle && (
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to={user ? (user.role?.toLowerCase() === 'doctor' ? '/physician' : `/${user.role?.toLowerCase() || 'patient'}`) : "/"} className="flex items-center gap-2 text-primary group cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Activity className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight">HealthCore</span>
          </Link>
        </div>

        {!user && (
          <nav className="hidden md:flex gap-1 text-sm font-medium absolute left-[50%] -translate-x-[50%] bg-muted/40 p-1 rounded-full border border-border/50">
            {topNavItems.map((item) => (
               <Link 
                 key={item.path}
                 to={item.path} 
                 className={cn(
                   "px-4 py-1.5 rounded-full transition-all duration-200",
                   location.pathname === item.path 
                     ? "bg-background text-foreground font-semibold" 
                     : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                 )}
               >
                 {item.name}
               </Link>
            ))}
          </nav>
        )}

        {user && showCenteredNav && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium absolute left-[50%] -translate-x-[50%] bg-muted/35 p-1 rounded-full border border-border/50 backdrop-blur">
            {topNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-1.5 rounded-full transition-all duration-200",
                  location.hash === item.path || location.pathname + location.hash === item.path
                    ? "bg-background text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <nav className="hidden md:flex items-center gap-4">
                 <Link to="/patient/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-2">Login</Link>
                 <Button asChild className="cursor-pointer rounded-full px-6">
                   <Link to="/patient/signup">Sign up</Link>
                 </Button>
              </nav>
              {!showSidebarToggle && topNavItems.length ? null : (
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <span className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors header-bell inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:bg-accent hover:text-accent-foreground h-9 w-9 md:h-10 md:w-10">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border border-background"></span>
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 rounded-full cursor-pointer pl-1.5 md:pl-2 pr-2 md:pr-3 py-1.5 border border-border bg-background hover:bg-accent transition-colors">
                    <div className="bg-primary/10 p-1 md:p-1.5 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium max-w-[150px] truncate max-md:hidden">
                      {user.email || "User"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {!user && mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-background border-b p-4 flex flex-col gap-2 md:hidden z-50 animate-in slide-in-from-top-2">
           {topNavItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={cn(
                  "text-sm font-medium p-3 rounded-xl transition-all",
                  location.pathname === item.path 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-accent text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
           ))}
           <div className="h-px w-full bg-border my-2"></div>
           <Link to="/patient/login" className="text-sm font-medium p-3 hover:bg-accent rounded-xl" onClick={() => setMobileMenuOpen(false)}>Login</Link>
           <Button asChild className="w-full mt-2 h-11 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
             <Link to="/patient/signup">Sign up</Link>
           </Button>
        </div>
      )}

      {user && showCenteredNav && mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b bg-background/95 p-4 md:hidden z-50 animate-in slide-in-from-top-2 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            {topNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  location.hash === item.path || location.pathname + location.hash === item.path
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
