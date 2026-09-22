import { Link, NavLink, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/Logo"
import Sidebar from "@/components/Sidebar"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate("/")
  }

  const linkClass = ({ isActive }) =>
    `link-underline text-sm font-medium transition-colors ${
      isActive ? "text-foreground" : "text-muted hover:text-foreground"
    }`

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <nav className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {user && (
            <button
              className="btn btn-ghost h-10 w-10 !p-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Menu"
              aria-expanded={sidebarOpen}
            >
              <MenuIcon />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight">LearnForge</span>
          </Link>
        </div>

        <div className="hidden items-center gap-7 md:flex">
          {user && user.role === "student" && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/my-certificates" className={linkClass}>
                My Certificates
              </NavLink>
            </>
          )}
          {user && user.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              Admin Console
            </NavLink>
          )}
          <NavLink to="/verify" className={linkClass}>
            Verify Certificate
          </NavLink>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-muted">
                Hi, <span className="font-semibold text-foreground">{user.name.split(" ")[0]}</span>
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        {!user && (
          <button
            className="btn btn-ghost md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle Menu"
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        )}
      </nav>

      {!user && open && (
        <div className="fade-in border-t md:hidden">
          <div className="container-page flex flex-col gap-3 py-4">
            <MobileLink to="/verify" onClick={() => setOpen(false)}>
              Verify Certificate
            </MobileLink>
            <div className="mt-2 flex gap-3">
              <Link to="/login" className="btn btn-ghost w-full" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary w-full" onClick={() => setOpen(false)}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </header>
  )
}

function MobileLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground"
        }`
      }
    >
      {children}
    </NavLink>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
