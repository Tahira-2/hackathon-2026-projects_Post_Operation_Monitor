import { useState } from 'react'
import { 
  Heart, Calendar, BarChart3, LogOut, Menu, X, 
  BookOpen, MessageCircle
} from 'lucide-react'

function PatientSidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart, href: '/dashboard/patient' },
    { id: 'therapy-library', label: 'Therapy Library', icon: BookOpen, href: '/therapy-library' },
    { id: 'my-sessions', label: 'My Sessions', icon: Calendar, href: '/my-sessions' },
    { id: 'progress', label: 'Progress & History', icon: BarChart3, href: '/progress' },
    { id: 'feedback', label: 'Feedback', icon: MessageCircle, href: '/feedback' },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[var(--color-primary)] p-2 text-white md:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-0 left-0 top-0 z-30 h-screen w-64 transform bg-[var(--color-surface)] shadow-lg transition-transform duration-300 flex flex-col md:static md:relative md:h-auto md:min-h-screen md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="border-b border-[var(--color-border)] p-6">
          <img src="/src/assets/Devcare-logo.png" alt="DevCare Logo" className="h-10 object-contain" />
        </div>

        {/* User Info */}
        <div className="border-b border-[var(--color-border)] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold">
              U
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">User</p>
              <p className="text-xs text-[var(--color-text-muted)]">Active</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--color-text)] transition-all duration-200 hover:bg-[var(--color-surface-soft)] group"
                  >
                    <IconComponent className="h-5 w-5 text-[var(--color-primary)] transition-colors duration-200 group-hover:text-[var(--color-primary)]" />
                    <span className="flex-1 text-sm font-medium group-hover:text-[var(--color-primary)]">
                      {item.label}
                    </span>
                    <span className="h-0.5 w-0 bg-[var(--color-primary)] transition-all duration-200 group-hover:w-8 rounded-full" />
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-[var(--color-border)] p-6">
          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-danger)] bg-opacity-10 px-4 py-3 text-[var(--color-danger)] font-medium transition-all duration-200 hover:bg-opacity-20 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default PatientSidebar
