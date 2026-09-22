export function Spinner({ className = "" }) {
  return <span className={`spinner ${className}`} aria-hidden="true" />
}

export function PageLoader({ label = "Loading" }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
      <span className="spinner" style={{ borderTopColor: "var(--color-primary)" }} />
      <span className="text-sm">{label}</span>
    </div>
  )
}
