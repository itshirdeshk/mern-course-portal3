import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { Spinner } from "@/components/Spinner"

const STATUS_META = {
  none: { label: "Not Submitted", cls: "badge-muted" },
  pending: { label: "Under Review", cls: "badge-warn" },
  approved: { label: "Approved", cls: "badge-success" },
  rejected: { label: "Rejected", cls: "badge-danger" },
}

export default function LinkedInSubmit({ slug, companyName, courseTitle, linkedin, allLecturesComplete, onUpdated }) {
  const toast = useToast()
  const [url, setUrl] = useState(linkedin?.url || "")
  const [busy, setBusy] = useState(false)

  const status = linkedin?.status || "none"
  const meta = STATUS_META[status]
  const locked = status === "approved"

  const suggestion = `I Just Completed "${courseTitle}" On LearnForge — Thanks To The Team At ${companyName} For The Opportunity! #LearnForge #${companyName.replace(/\s+/g, "")}`

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy || locked) return
    setBusy(true)
    try {
      const res = await api(`/courses/${slug}/linkedin`, {
        method: "POST",
        body: { url },
      })
      toast.success("Submitted For Review")
      setUrl("")
      onUpdated?.(res)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Share On LinkedIn</h3>
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Post About Your Achievement, Tag <span className="font-semibold text-foreground">{companyName}</span>, Then Paste
        The Post URL Below For Review.
      </p>

      <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Suggested Caption</p>
        <p className="mt-1.5 text-sm leading-relaxed">{suggestion}</p>
        <button
          type="button"
          className="btn btn-ghost mt-3 h-8 px-3 text-xs"
          onClick={() => {
            navigator.clipboard?.writeText(suggestion)
            toast.success("Caption Copied")
          }}
        >
          Copy Caption
        </button>
      </div>

      {linkedin?.url && status !== "none" && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 p-3 text-xs">
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-muted">Current Submission: </span>
            <a
              href={linkedin.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline truncate inline-block max-w-[80%] align-bottom"
            >
              {linkedin.url}
            </a>
          </div>
          <span className={`badge shrink-0 ${meta.cls}`}>{meta.label}</span>
        </div>
      )}

      {linkedin?.reviewNote && status === "rejected" && (
        <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          Reviewer Note: {linkedin.reviewNote}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <input
          type="url"
          className="input"
          placeholder="https://www.linkedin.com/posts/... or https://lnkd.in/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={locked}
          required
        />
        {!allLecturesComplete && (
          <p className="text-xs text-muted">
            You Can Submit Anytime, But The Certificate Also Requires All Lectures And A Passing Quiz Score.
          </p>
        )}
        {locked ? (
          <p className="text-sm font-medium text-success">Your Submission Has Been Approved. Thank You!</p>
        ) : (
          <button type="submit" className="btn btn-primary self-start" disabled={busy}>
            {busy ? <Spinner /> : status === "rejected" ? "Resubmit For Review" : "Submit For Review"}
          </button>
        )}
      </form>
    </div>
  )
}
