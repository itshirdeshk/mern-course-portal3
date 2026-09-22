import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader } from "@/components/Spinner"

export default function AdminCourses() {
  const toast = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api("/admin/courses")
      .then((res) => setCourses(res.courses))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id, title) {
    if (!window.confirm(`Delete "${title}"? This Also Removes Student Enrollments For It.`)) return
    try {
      await api(`/admin/courses/${id}`, { method: "DELETE" })
      toast.success("Course Deleted")
      setCourses((cs) => cs.filter((c) => c._id !== id))
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <PageLoader label="Loading Courses" />

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">All Courses</h2>
        <Link to="/admin/courses/new" className="btn btn-primary">
          + New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold">No Courses Yet</p>
          <p className="mt-2 text-sm text-muted">Create Your First Course To Get Started.</p>
          <Link to="/admin/courses/new" className="btn btn-primary mt-6">
            Create Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Company</th>
                <th className="px-5 py-3 font-semibold">Lectures</th>
                <th className="px-5 py-3 font-semibold">Quiz</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c) => (
                <tr key={c._id} className="bg-surface transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-muted">/{c.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{c.companyName}</td>
                  <td className="px-5 py-3.5 tabular-nums">{c.lectures?.length || 0}</td>
                  <td className="px-5 py-3.5 tabular-nums">{c.quiz?.questions?.length || 0} Qs</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${c.published ? "badge-success" : "badge-muted"}`}>
                      {c.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/courses/${c._id}`} className="btn btn-ghost h-8 px-3 text-xs">
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(c._id, c.title)}
                        className="btn btn-ghost h-8 px-3 text-xs text-danger hover:bg-danger/10"
                      >
                        Delete
                      </button>
                    </div>
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
