import { useSelector, useDispatch } from "react-redux"
import { cn } from "@/lib/utils"
import { Bell, Search, User, LogOut, Menu } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import type { RootState } from "@/store"
import { useLogoutMutation } from "@/apis/auth"
import { logoutUserAction } from "@/store/features/authSlice"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function DashboardTopBar() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [logoutApi] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden w-64 md:flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-xl bg-muted/50 pl-9 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
        </Button>

        {user?.role?.toLowerCase() !== 'patient' && (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className={cn(
                "flex items-center gap-2 rounded-full cursor-pointer border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-all",
                "pl-2 pr-3 py-1.5"
              )}>
                <div className="p-1 rounded-full bg-emerald-600/10">
                  <User className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold max-w-[120px] truncate max-md:hidden">
                  {user?.email?.split('@')[0] || "Profile"}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-emerald-900/10 shadow-xl shadow-emerald-900/5">
              <DropdownMenuLabel className="font-bold text-slate-900">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-emerald-900/5" />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-xl focus:bg-emerald-50 focus:text-emerald-700">
                <Link to={`/${user?.role?.toLowerCase() === 'doctor' ? 'physician' : (user?.role?.toLowerCase() || 'patient')}/profile`}>
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
        )}
      </div>
    </header>
  )
}
