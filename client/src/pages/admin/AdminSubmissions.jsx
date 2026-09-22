import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader, Spinner } from "@/components/Spinner"

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
]

const STATUS_CLS = {
  pending: "badge-warn",
  approved: "badge-success",
  rejected: "badge-danger",
  none: "badge-muted",
}

function ReviewCard({ sub, onReviewed }) {
  const toast = useToast()
  const [note, setNote] = useState(sub.linkedin.reviewNote || "")
  const [busy, setBusy] = useState(false)

  async function review(decision) {
    if (decision === "rejected" && !note.trim()) {
      toast.error("Please Add A Note Explaining The Rejection")
      return
    }
    setBusy(true)
    try {
      const res = await api(`/admin/submissions/${sub.id}/review`, {
        method: "POST",
        body: { decision, reviewNote: note },
      })
      toast.success(decision === "approved" ? "Submission Approved" : "Submission Rejected")
      onReviewed(sub.id, res.linkedin)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const status = sub.linkedin.status

  return (
    <div className="card fade-up p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{sub.student?.name || "Unknown Student"}</p>
          <p className="text-xs text-muted">{sub.student?.email}</p>
        </div>
        <span className={`badge ${STATUS_CLS[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p className="text-muted">
          Course: <span className="font-medium text-foreground">{sub.course?.title}</span>
        </p>
        <p className="text-muted">
          Tag Target: <span className="font-medium text-foreground">{sub.course?.companyName}</span>
        </p>
        <p className="text-muted">
          Quiz: <span className="font-medium text-foreground">{sub.quizPassed ? `Passed (${sub.bestScore}%)` : "Not Passed"}</span>
        </p>
      </div>

      <a
        href={sub.linkedin.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary link-underline"
      >
        Open LinkedIn Post ↗
      </a>

      <div className="mt-4">
        <textarea
          className="input min-h-16 resize-y text-sm"
          placeholder="Review Note (Required When Rejecting)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary flex-1" onClick={() => review("approved")} disabled={busy}>
          {busy ? <Spinner /> : "Approve"}
        </button>
        <button
          className="btn btn-secondary flex-1 border-danger/40 text-danger hover:bg-danger/10"
          onClick={() => review("rejected")}
          disabled={busy}
        >
          Reject
        </button>
      </div>
    </div>
  )
}

export default function AdminSubmissions() {
  const [filter, setFilter] = useState("pending")
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)

  function load(status) {
    setLoading(true)
    api(`/admin/submissions?status=${status}`)
      .then((res) => setSubs(res.submissions))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(filter)
  }, [filter])

  function onReviewed(id, linkedin) {
    if (filter === "all") {
      setSubs((s) => s.map((x) => (x.id === id ? { ...x, linkedin } : x)))
    } else {
      setSubs((s) => s.filter((x) => x.id !== id))
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">LinkedIn Submissions</h2>
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? "bg-primary text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading Submissions" />
      ) : subs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold">Nothing Here</p>
          <p className="mt-2 text-sm text-muted">There Are No {filter === "all" ? "" : filter} Submissions Right Now.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subs.map((sub) => (
            <ReviewCard key={sub.id} sub={sub} onReviewed={onReviewed} />
          ))}
        </div>
      )}
    </div>
  )
}
