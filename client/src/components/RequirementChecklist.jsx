function CheckIcon({ met }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors"
      style={{
        background: met ? "rgba(53,201,139,0.16)" : "var(--color-surface-2)",
        color: met ? "var(--color-success)" : "var(--color-muted)",
        border: `1px solid ${met ? "rgba(53,201,139,0.5)" : "var(--color-border)"}`,
      }}
    >
      {met ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
    </span>
  )
}

export default function RequirementChecklist({ gate, linkedin }) {
  const r = gate.requirements
  const items = [
    {
      met: r.lectures.met,
      title: "Complete All Lectures",
      detail: `${r.lectures.completedCount} Of ${r.lectures.total} Lectures Completed`,
    },
    {
      met: r.quiz.met,
      title: "Pass The Final Assessment",
      detail: r.quiz.hasQuiz
        ? r.quiz.met
          ? `Passed With ${r.quiz.bestScore}%`
          : "Not Passed Yet"
        : "No Assessment Required",
    },
    {
      met: r.linkedin.met,
      title: "Share On LinkedIn And Tag The Company",
      detail:
        r.linkedin.status === "approved"
          ? "Approved By Reviewer"
          : r.linkedin.status === "pending"
            ? "Under Review"
            : r.linkedin.status === "rejected"
              ? "Rejected — Please Resubmit"
              : "Not Submitted Yet",
    },
  ]

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckIcon met={item.met} />
          <div>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted">{item.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
