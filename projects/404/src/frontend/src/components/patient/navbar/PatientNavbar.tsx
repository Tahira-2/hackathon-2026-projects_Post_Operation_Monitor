import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

type PatientNavbarItem = {
  name: string
  path: string
}

interface PatientNavbarProps {
  items: PatientNavbarItem[]
}

export function PatientNavbar({ items }: PatientNavbarProps) {
  const location = useLocation()

  return (
    <nav className="sticky top-16 z-40 w-full border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 md:px-8 lg:px-10">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap">
          {items.map((item) => {
            const isActive = location.hash === item.path || location.pathname + location.hash === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-black shadow-sm"
                    : "bg-white/10 text-white/85 hover:bg-white/15 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}