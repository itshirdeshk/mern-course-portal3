import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { PageLoader } from "@/components/Spinner"

const CARDS = [
  { key: "students", label: "Total Students", accent: "var(--color-primary)" },
  { key: "courses", label: "Courses", accent: "var(--color-accent)" },
  { key: "pendingReviews", label: "Pending Reviews", accent: "var(--color-warn)" },
  { key: "certificates", label: "Certificates Issued", accent: "var(--color-success)" },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api("/admin/stats")
      .then((res) => active && setStats(res))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading Metrics" />

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, i) => (
          <div key={c.key} className="card lift fade-up p-6" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="h-1 w-10 rounded-full" style={{ background: c.accent }} />
            <p className="mt-4 text-4xl font-extrabold tabular-nums">{stats[c.key] ?? 0}</p>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/courses/new" className="card lift group p-6">
          <h3 className="text-lg font-bold transition-colors group-hover:text-primary">Create A New Course</h3>
          <p className="mt-1.5 text-sm text-muted">Add Lectures, Build A Quiz, And Publish When Ready.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
            Get Started →
          </span>
        </Link>
        <Link to="/admin/submissions" className="card lift group p-6">
          <h3 className="text-lg font-bold transition-colors group-hover:text-primary">Review LinkedIn Submissions</h3>
          <p className="mt-1.5 text-sm text-muted">
            {stats.pendingReviews > 0
              ? `${stats.pendingReviews} Submission(s) Waiting For Your Review.`
              : "You Are All Caught Up On Reviews."}
          </p>
          <span className="mt-4 inline-block text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
            Open Queue →
          </span>
        </Link>
      </div>
    </div>
  )
}
