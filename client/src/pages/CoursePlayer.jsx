import { useEffect, useMemo, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader, Spinner } from "@/components/Spinner"
import RequirementChecklist from "@/components/RequirementChecklist"
import LinkedInSubmit from "@/components/LinkedInSubmit"

function isYouTube(url = "") {
  return /youtube\.com|youtu\.be/.test(url)
}
function youTubeEmbed(url) {
  const idMatch = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/)
  return idMatch ? `https://www.youtube.com/embed/${idMatch[1]}` : url
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function CoursePlayer() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeId, setActiveId] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [watchedEnough, setWatchedEnough] = useState(false)

  async function load() {
    const res = await api(`/courses/${slug}`)
    setData(res)
    // enroll silently on first open
    if (!res.enrolled) {
      await api(`/courses/${slug}/enroll`, { method: "POST" }).catch(() => {})
    }
    return res
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    load()
      .then((res) => {
        if (!active) return
        const firstUnlockedIncomplete =
          res.progress.lectures.find((l) => l.unlocked && !l.completed) ||
          res.progress.lectures.find((l) => l.unlocked) ||
          res.progress.lectures[0]
        setActiveId(firstUnlockedIncomplete?.id || null)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const lectures = data?.progress.lectures || []
  const active = useMemo(() => lectures.find((l) => l.id === activeId) || null, [lectures, activeId])

  // Reset the "watched enough" gate whenever the active lecture changes.
  useEffect(() => {
    setWatchedEnough(false)
  }, [activeId])

  function selectLecture(lec) {
    if (!lec.unlocked) {
      toast.error("Finish The Previous Lectures First")
      return
    }
    setActiveId(lec.id)
  }

  async function markComplete() {
    if (!active || completing) return
    setCompleting(true)
    try {
      const res = await api(`/courses/${slug}/lectures/${active.id}/complete`, { method: "POST" })
      setData((prev) => ({ ...prev, progress: res.progress, gate: res.gate }))
      toast.success("Lecture Completed")
      // advance to next unlocked lecture
      const next = res.progress.lectures.find((l) => l.unlocked && !l.completed)
      if (next) {
        setActiveId(next.id)
      } else if (res.progress.allLecturesComplete) {
        toast.info("All Lectures Done — The Assessment Is Unlocked")
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) return <PageLoader label="Loading Course" />
  if (error)
    return (
      <div className="container-page py-16">
        <div className="card border-danger/50 p-6 text-center">
          <p className="font-semibold text-danger">{error}</p>
          <Link to="/dashboard" className="btn btn-ghost mt-4">
            Back To Dashboard
          </Link>
        </div>
      </div>
    )

  const { course, progress, gate, linkedin } = data
  const progressPct = progress.total ? Math.round((progress.completedCount / progress.total) * 100) : 0

  return (
    <div className="container-page py-8">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        ← Back To Dashboard
      </Link>

      <div className="fade-up mb-6">
        <span className="text-xs font-semibold text-accent">{course.category}</span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{course.title}</h1>
        <p className="mt-1.5 max-w-2xl text-muted">{course.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Player + active lecture */}
        <div className="flex flex-col gap-5">
          <div className="card overflow-hidden">
            <div className="relative aspect-video w-full bg-black">
              {active ? (
                isYouTube(active.videoUrl) ? (
                  <iframe
                    key={active.id}
                    src={youTubeEmbed(active.videoUrl)}
                    title={active.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    key={active.id}
                    src={active.videoUrl}
                    controls
                    className="h-full w-full"
                    onTimeUpdate={(e) => {
                      const v = e.currentTarget
                      if (v.duration && v.currentTime / v.duration >= 0.9) setWatchedEnough(true)
                    }}
                    onEnded={() => setWatchedEnough(true)}
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-muted">No Lecture Selected</div>
              )}
            </div>

            {active && (
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-accent">Lecture {active.index + 1}</p>
                  <h2 className="mt-0.5 text-lg font-bold">{active.title}</h2>
                  {active.description && <p className="mt-1 text-sm text-muted">{active.description}</p>}
                </div>
                {active.completed ? (
                  <span className="badge badge-success shrink-0">
                    <CheckIcon /> Completed
                  </span>
                ) : (
                  <button className="btn btn-primary shrink-0" onClick={markComplete} disabled={completing}>
                    {completing ? <Spinner /> : "Mark As Complete"}
                  </button>
                )}
              </div>
            )}
            {active && !active.completed && !isYouTube(active.videoUrl) && !watchedEnough && (
              <p className="border-t px-5 py-3 text-xs text-muted">
                Tip: Watch The Lecture To The End Before Marking It Complete.
              </p>
            )}
          </div>

          {/* Requirements + next actions */}
          <div className="card p-6">
            <h3 className="text-lg font-bold">Certificate Requirements</h3>
            <p className="mt-1 text-sm text-muted">Complete Every Step Below To Unlock Your Certificate.</p>
            <div className="mt-5">
              <RequirementChecklist gate={gate} linkedin={linkedin} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
              <button
                className={`btn ${!gate.requirements.quiz.met && progress.allLecturesComplete ? "btn-primary" : "btn-secondary"}`}
                disabled={!progress.allLecturesComplete}
                onClick={() => navigate(`/learn/${slug}/quiz`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {gate.requirements.quiz.met ? "Review Assessment" : "Take The Assessment"}
              </button>
              <button
                className="btn btn-accent"
                disabled={!gate.eligible}
                onClick={() => navigate(`/learn/${slug}/certificate`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                </svg>
                {gate.alreadyIssued ? "View Certificate" : "Unlock Certificate"}
              </button>
            </div>
          </div>

          {/* LinkedIn submission */}
          <LinkedInSubmit
            slug={slug}
            companyName={course.companyName}
            courseTitle={course.title}
            linkedin={linkedin}
            allLecturesComplete={progress.allLecturesComplete}
            onUpdated={(res) => setData((prev) => ({ ...prev, linkedin: res.linkedin, gate: res.gate }))}
          />
        </div>

        {/* Curriculum sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="border-b p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">Course Progress</span>
                <span className="text-muted">{progressPct}%</span>
              </div>
              <div className="progress mt-2">
                <span style={{ width: `${progressPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted">
                {progress.completedCount} Of {progress.total} Lectures Completed
              </p>
            </div>
            <ul className="max-h-[28rem] overflow-y-auto">
              {lectures.map((lec) => {
                const isActive = lec.id === activeId
                return (
                  <li key={lec.id}>
                    <button
                      onClick={() => selectLecture(lec)}
                      disabled={!lec.unlocked}
                      className={`flex w-full items-center gap-3 border-b px-5 py-3.5 text-left transition-colors ${
                        isActive ? "bg-primary-soft" : lec.unlocked ? "hover:bg-surface-2" : "opacity-55"
                      }`}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                          background: lec.completed
                            ? "rgba(53,201,139,0.16)"
                            : isActive
                              ? "var(--color-primary)"
                              : "var(--color-surface-2)",
                          color: lec.completed
                            ? "var(--color-success)"
                            : isActive
                              ? "#fff"
                              : "var(--color-muted)",
                        }}
                      >
                        {lec.completed ? <CheckIcon /> : lec.unlocked ? lec.index + 1 : <LockIcon />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{lec.title}</span>
                        <span className="block text-xs text-muted">
                          {lec.completed ? "Completed" : lec.unlocked ? "Available" : "Locked"}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
