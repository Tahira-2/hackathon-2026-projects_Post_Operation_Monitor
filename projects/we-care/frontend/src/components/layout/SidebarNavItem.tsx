import { NavLink, type To } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface SidebarNavItemProps {
  to: To
  label: string
  icon: LucideIcon
  end?: boolean
}

export function SidebarNavItem({ to, label, icon: Icon, end }: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}
