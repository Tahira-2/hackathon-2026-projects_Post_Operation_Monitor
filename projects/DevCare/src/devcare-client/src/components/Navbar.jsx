import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import logo from '../assets/Devcare-logo.png'

const ACCESS_TOKEN_KEY = 'devcare_access_token'
const ROLE_KEY = 'devcare_role'

function getIsAuthenticated() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}


function Navbar() {
  const isAuthenticated = getIsAuthenticated()
  const role = localStorage.getItem(ROLE_KEY)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const username = localStorage.getItem('devcare_username')

  const handleLogout = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('devcare_')) {
        localStorage.removeItem(key)
      }
    })
    window.location.href = '/'
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  let navItems = []
  if (isAuthenticated) {
    if (role === 'doctor') {
      navItems = [
        { label: 'Dashboard', href: '/doctor/dashboard' },
        { label: 'Patients', href: '/doctor/patients' },
        { label: 'Assign', href: '/doctor/assign' },
        { label: 'Connect', href: '/doctor/share' },
      ]
    } else if (role === 'patient') {
      navItems = [
        { label: 'Dashboard', href: '/dashboard/patient' },
      ]
    } else {
      navItems = [{ label: 'Dashboard', href: '/dashboard' }]
    }
  } else {
    navItems = [
      { label: 'Home', href: '#home', anchor: true },
      { label: 'How it works', href: '#how-it-works', anchor: true },
      { label: 'Features', href: '#features', anchor: true },
      { label: 'FAQ', href: '#faq', anchor: true },
    ]
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[rgba(255,255,255,0.8)] backdrop-blur-md">
      <nav className="site-container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="DevCare Logo" className="h-10 w-auto" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.anchor ? (
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              ) : (
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    isActive ? 'nav-link nav-link-active' : 'nav-link'
                  }
                >
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-[var(--color-primary)] bg-white"
              />
              <span className="font-semibold text-base hidden sm:inline">{username || 'User'}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white border border-[var(--color-border)] z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-soft)] rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <Link to="/login" className="nav-link font-semibold">
              Login
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar