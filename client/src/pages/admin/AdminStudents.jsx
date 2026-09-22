import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { PageLoader } from "@/components/Spinner"

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let active = true
    api("/admin/students")
      .then((res) => active && setStudents(res.students))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading Students" />

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) || s.email.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Students</h2>
        <input
          className="input h-10 w-64 max-w-full"
          placeholder="Search By Name Or Email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold">No Students Found</p>
          <p className="mt-2 text-sm text-muted">Try A Different Search Or Wait For Sign-Ups.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Joined</th>
                <th className="px-5 py-3 font-semibold">Enrollments</th>
                <th className="px-5 py-3 font-semibold">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="bg-surface transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{formatDate(s.createdAt)}</td>
                  <td className="px-5 py-3.5 tabular-nums">{s.enrollments}</td>
                  <td className="px-5 py-3.5">
                    <span className="badge badge-success">{s.certificates} Earned</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
