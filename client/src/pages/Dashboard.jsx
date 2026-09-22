import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { PageLoader } from "@/components/Spinner"

function CourseCard({ course, index }) {
  return (
    <Link
      to={`/learn/${course.slug}`}
      className="card lift fade-up group flex flex-col overflow-hidden"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div
        className="relative h-40 w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(124,108,246,0.35), rgba(245,196,81,0.2)), radial-gradient(20rem 20rem at 80% 20%, rgba(124,108,246,0.4), transparent 60%)",
        }}
      >
        {course.coverImage ? (
          <img
            src={course.coverImage || "/placeholder.svg"}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-5xl font-black text-white/80">{course.title.charAt(0)}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          {course.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold text-accent">{course.category}</span>
        <h3 className="mt-1.5 text-lg font-bold leading-snug transition-colors group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted">{course.subtitle}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted">
          <span>{course.lectureCount} Lectures</span>
          <span className="font-semibold text-primary transition-transform group-hover:translate-x-1">
            Start Learning →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    api("/courses", { auth: false })
      .then((data) => active && setCourses(data.courses))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading Courses" />

  return (
    <div className="container-page py-12">
      <div className="fade-up mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-muted">Pick A Course, Complete The Path, And Earn Your Verified Certificate.</p>
      </div>

      {error && (
        <div className="card border-danger/50 p-4 text-sm text-danger">Could Not Load Courses: {error}</div>
      )}

      {!error && courses.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold">No Courses Available Yet</p>
          <p className="mt-2 text-sm text-muted">Please Check Back Soon — New Courses Are On The Way.</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i} />
        ))}
      </div>
    </div>
  )
}
