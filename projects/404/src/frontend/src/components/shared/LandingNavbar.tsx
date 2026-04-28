import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", path: "/" },
  { name: "Solutions", path: "/services" },
  { name: "About", path: "/about" },
]

interface LandingNavbarProps {
  forceScrolled?: boolean
}

export function LandingNavbar({ forceScrolled = false }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(forceScrolled)
  const location = useLocation()

  useEffect(() => {
    if (forceScrolled) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [forceScrolled])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-emerald-900/10 bg-white/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-10">
        <Link to="/" className={cn("flex items-center gap-2 transition-opacity hover:opacity-80", isScrolled ? "text-emerald-900" : "text-white")}>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full backdrop-blur", isScrolled ? "border border-emerald-900/15 bg-emerald-50" : "border border-white/15 bg-white/10")}>
            <span className="text-sm font-semibold">H</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">HealthCore</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-1 py-2 text-[15px] font-semibold transition-colors duration-200",
                  isActive
                    ? isScrolled ? "text-emerald-900" : "text-white"
                    : isScrolled ? "text-slate-700 hover:text-emerald-900" : "text-white/80 hover:text-white"
                )}
              >
                {item.name}
                {isActive && <span className={cn("absolute -bottom-1 left-0 h-0.5 w-full rounded-full", isScrolled ? "bg-emerald-700" : "bg-white")} />}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/patient/login" className={cn("text-sm font-semibold transition-colors", isScrolled ? "text-slate-700 hover:text-emerald-900" : "text-white/80 hover:text-white")}>
            Log in
          </Link>
          <Button asChild className={cn("h-10 rounded-xl px-5", isScrolled ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-white text-[#1a3321] hover:bg-white/90")}>
            <Link to="/patient/signup">Get Started</Link>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden hover:bg-white/10 hover:text-white", isScrolled ? "text-slate-700" : "text-white")}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-emerald-900/10 bg-white/95 px-4 py-4 backdrop-blur-md md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="my-2 h-px bg-emerald-900/10" />
            <Link
              to="/patient/login"
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log in
            </Link>
            <Button asChild className="mt-2 h-11 rounded-full bg-emerald-700 px-5 text-white hover:bg-emerald-800">
              <Link to="/patient/signup" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
