import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, CalendarHeart, FileText, Settings, PanelLeftClose, PanelLeftOpen, FileStack, Stethoscope, Wallet, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: "admin" | "physician" | "patient"
}

// Emulating the requested dark B2B layout mimicking loan dashboard screenshot
export function Sidebar({ role }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev)
    document.addEventListener("toggleSidebar", handleToggle)
    return () => document.removeEventListener("toggleSidebar", handleToggle)
  }, [])

  // Auto-close mobile sidebar when navigation occurs
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])
  
  const navItems = {
    admin: [
      { group: "ACCESS CONTROL", items: [
        { name: "Roles", href: "/admin/roles", icon: Users },
        { name: "Permissions", href: "/admin/permissions", icon: Settings },
      ]},
      { group: "MANAGEMENT", items: [
        { name: "Users", href: "/admin", icon: Users },
        { name: "Tenants", href: "/admin/tenants", icon: LayoutDashboard },
        { name: "Requests", href: "/admin/requests", icon: FileStack },
      ]},
      { group: "SYSTEM", items: [
        { name: "Rules", href: "/admin/rules", icon: FileText },
        { name: "Wallets", href: "/admin/wallets", icon: Wallet },
      ]},
    ],
    physician: [
      { group: "DASHBOARD", items: [
        { name: "Overview", href: "/physician", icon: LayoutDashboard },
      ]},
      { group: "CLINICAL", items: [
        { name: "Patients", href: "/physician/patients", icon: Users },
        { name: "Appointments", href: "/physician/appointments", icon: CalendarHeart },
        { name: "Treatment Plans", href: "/physician/plans", icon: Stethoscope },
      ]}
    ],
    patient: [
      { group: "DASHBOARD", items: [
        { name: "Health Summary", href: "/patient", icon: LayoutDashboard },
      ]},
      { group: "MANAGEMENT", items: [
        { name: "My Records", href: "/patient/records", icon: FileText },
        { name: "Appointments", href: "/patient/appointments", icon: CalendarHeart },
      ]}
    ]
  }

  const groups = navItems[role]

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={cn(
        "border-r bg-card transition-all duration-300 ease-in-out relative z-[70] flex flex-col",
        // Desktop
        "max-md:hidden md:flex",
        isCollapsed ? "md:w-20" : "md:w-64",
        // Mobile Sliding
        mobileOpen && "max-md:absolute max-md:flex max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:h-screen w-64 border-r max-md:translate-x-0"
      )}>
        {/* Mobile Header Inside Sidebar */}
        <div className="flex md:hidden items-center justify-between p-4 border-b">
          <span className="font-bold tracking-tight text-lg">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5"/>
          </button>
        </div>

        {/* Toggle Button Desktop */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-background p-1 rounded-sm border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-50 cursor-pointer hidden md:flex"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <div className="flex flex-col flex-1 py-4 pt-6 overflow-y-auto hide-scrollbars overflow-x-hidden">
          
          {groups.map((group, idx) => (
            <div key={idx} className={cn("mb-6", isCollapsed ? "px-2" : "px-4")}>
              {(!isCollapsed || mobileOpen) && (
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 select-none">
                  {group.group}
                </h4>
              )}
              
              <nav className="grid gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href || (item.href !== `/${role}` && location.pathname.startsWith(item.href + '/'))
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      title={isCollapsed && !mobileOpen ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2.5 transition-all outline-none cursor-pointer",
                        isCollapsed && !mobileOpen ? "justify-center px-0" : "px-3",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className={cn("shrink-0", isCollapsed && !mobileOpen ? "h-5 w-5" : "h-[18px] w-[18px]")} />
                      {(!isCollapsed || mobileOpen) && <span className="text-sm font-medium">{item.name}</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
