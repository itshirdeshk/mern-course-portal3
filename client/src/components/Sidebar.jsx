import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/Logo"

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("")
}

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  certificate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M9 14.5 8 22l4-2 4 2-1-7.5" />
    </svg>
  ),
  verify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V6l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8.5 16a3.5 3.5 0 0 1 7 0" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
}

function NavItem({ to, end, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          isActive
            ? "bg-[#211f3d] text-white border border-[#7c6cf6]/40 shadow-[0_0_15px_rgba(124,108,246,0.2)] font-semibold"
            : "text-[#9297ad] hover:bg-[#1a1c2b] hover:text-[#eceef5]"
        }`
      }
    >
      <span className="h-5 w-5 shrink-0 text-primary">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ courses: null, certificates: null })

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose()
    }
    if (open) {
      document.addEventListener("keydown", onKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !user) return
    let active = true
    Promise.all([
      api("/courses", { auth: false }).catch(() => ({ courses: [] })),
      user.role === "student"
        ? api("/courses/me/certificates").catch(() => ({ certificates: [] }))
        : Promise.resolve({ certificates: [] }),
    ]).then(([c, certs]) => {
      if (!active) return
      setStats({
        courses: c.courses?.length ?? 0,
        certificates: certs.certificates?.length ?? 0,
      })
    })
    return () => {
      active = false
    }
  }, [open, user])

  function handleLogout() {
    onClose()
    logout()
    navigate("/")
  }

  if (!user || typeof document === "undefined") return null

  const content = (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 99999 }}>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${
          open ? "opacity-100" : "opacity-0 !pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 flex h-full w-[21rem] max-w-[85vw] flex-col border-r border-[#262838] bg-[#12131f] text-[#eceef5] shadow-[0_25px_70px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out pointer-events-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#12131f" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Sidebar"
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#262838] px-5 bg-[#12131f]">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-extrabold tracking-tight text-white">LearnForge</span>
          </Link>
          <button
            className="btn btn-ghost h-9 w-9 !p-0 rounded-lg hover:bg-[#1a1c2b]"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#262838] bg-[#12131f] shrink-0">
          <div className="rounded-2xl border border-[#262838] bg-[#1a1c2b] p-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-strong text-base font-bold text-white shadow-md ring-2 ring-primary/40">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{user.name}</p>
                <p className="truncate text-xs text-[#9297ad]">{user.email}</p>
              </div>
            </div>
            <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-[#262838]/80">
              <span className="text-xs text-[#9297ad]">Account Role</span>
              <span className={`badge ${user.role === "admin" ? "badge-muted" : "badge-success"}`}>
                {user.role === "admin" ? "Administrator" : "Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {user.role === "student" && (
          <div className="grid grid-cols-2 gap-3 px-4 py-3 border-b border-[#262838] bg-[#12131f] shrink-0">
            <div className="rounded-xl border border-[#262838] bg-[#1a1c2b] p-3.5 text-center">
              <p className="text-2xl font-bold text-primary">{stats.courses ?? "—"}</p>
              <p className="mt-0.5 text-xs text-[#9297ad]">Courses Available</p>
            </div>
            <div className="rounded-xl border border-[#262838] bg-[#1a1c2b] p-3.5 text-center">
              <p className="text-2xl font-bold text-accent">{stats.certificates ?? "—"}</p>
              <p className="mt-0.5 text-xs text-[#9297ad]">Certificates Earned</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4 bg-[#12131f]">
          {user.role === "student" && (
            <>
              <NavItem to="/dashboard" icon={icons.dashboard} label="Dashboard" onClick={onClose} />
              <NavItem to="/my-certificates" icon={icons.certificate} label="My Certificates" onClick={onClose} />
            </>
          )}
          {user.role === "admin" && (
            <NavItem to="/admin" end icon={icons.admin} label="Admin Console" onClick={onClose} />
          )}
          <NavItem to="/verify" icon={icons.verify} label="Verify Certificate" onClick={onClose} />
        </nav>

        {/* Footer actions */}
        <div className="border-t border-[#262838] p-4 bg-[#12131f] space-y-2 shrink-0">
          {user.role === "student" && (
            <Link to="/dashboard" onClick={onClose} className="btn btn-primary w-full shadow-lg">
              Continue Learning
            </Link>
          )}
          <button
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#9297ad] transition-colors hover:bg-danger/10 hover:text-danger"
            onClick={handleLogout}
          >
            <span className="h-4 w-4 shrink-0">{icons.logout}</span>
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  )

  return createPortal(content, document.body)
}
