import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";
import Button from "../ui/Button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const navStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 100,
    width: "100%",
    transition: "box-shadow 0.2s ease, background-color 0.2s ease",
    backgroundColor: scrolled
      ? "rgba(248,250,252,0.92)"
      : "rgba(248,250,252,0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: scrolled
      ? "1px solid var(--color-border)"
      : "1px solid transparent",
    boxShadow: scrolled ? "var(--shadow-sm)" : "none",
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: 1200,
    marginInline: "auto",
    paddingInline: "1.5rem",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 800,
    fontSize: "1.25rem",
    letterSpacing: "-0.03em",
    color: "var(--color-gray-900)",
    textDecoration: "none",
  };

  const linkBase: React.CSSProperties = {
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "var(--color-gray-600)",
    transition: "color 0.15s ease",
    padding: "0.25rem 0",
    position: "relative",
  };

  const linkActive: React.CSSProperties = {
    ...linkBase,
    color: "var(--color-primary-600)",
    fontWeight: 600,
  };

  return (
    <nav style={navStyle} role="navigation" aria-label="Main navigation">
      <div style={innerStyle}>
        {/* Logo */}
        <Link to="/" style={logoStyle} aria-label="CareFlow AI home">
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background:
                "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}
          >
            <Heart size={18} color="#fff" fill="#fff" />
          </span>
          CareFlow <span style={{ color: "var(--color-primary-600)" }}>AI</span>
        </Link>

        {/* Desktop links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "2rem" }}
          className="desktop-nav"
          aria-label="Desktop navigation links"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={location.pathname === link.to ? linkActive : linkBase}
              onMouseEnter={(e) => {
                if (location.pathname !== link.to)
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-gray-900)";
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.to)
                  (e.currentTarget as HTMLElement).style.color =
                    "var(--color-gray-600)";
              }}
            >
              {link.label}
              {location.pathname === link.to && (
                <span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    borderRadius: 99,
                    backgroundColor: "var(--color-primary-600)",
                  }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div
          className="desktop-cta"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/register/patient')}>
            Get Started
          </Button>
        </div>

        {/* Hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="hamburger-btn"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.375rem",
            color: "var(--color-gray-700)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          style={{
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            padding: "1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: "0.625rem 0.75rem",
                borderRadius: "var(--radius-md)",
                fontSize: "1rem",
                fontWeight: location.pathname === link.to ? 600 : 500,
                color:
                  location.pathname === link.to
                    ? "var(--color-primary-600)"
                    : "var(--color-gray-700)",
                backgroundColor:
                  location.pathname === link.to
                    ? "var(--color-primary-50)"
                    : "transparent",
                transition: "background-color 0.15s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/login/patient')}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/register/patient')}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Responsive styles injected inline */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-nav  { display: none !important; }
          .desktop-cta  { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
