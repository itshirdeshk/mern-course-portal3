import { NavLink, Outlet } from "react-router-dom"

const links = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/submissions", label: "Submissions" },
  { to: "/admin/students", label: "Students" },
]

export default function AdminLayout() {
  return (
    <div className="container-page py-8">
      <div className="fade-up mb-6">
        <span className="badge badge-muted">Admin Console</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Manage LearnForge</h1>
        <p className="mt-1.5 text-muted">Create Courses, Review Submissions, And Track Student Progress.</p>
      </div>

      <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white" : "text-muted hover:bg-surface-2 hover:text-foreground"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
