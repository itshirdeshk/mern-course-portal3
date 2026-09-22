import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import { PageLoader } from "@/components/Spinner"

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default function MyCertificates() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api("/courses/me/certificates")
      .then((res) => active && setCerts(res.certificates))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading Certificates" />

  return (
    <div className="container-page py-12">
      <div className="fade-up mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="mt-2 text-muted">Every Credential You Have Earned On LearnForge.</p>
      </div>

      {certs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg font-semibold">No Certificates Yet</p>
          <p className="mt-2 text-sm text-muted">Complete A Course To Earn Your First Certificate.</p>
          <Link to="/dashboard" className="btn btn-primary mt-6">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c, i) => (
            <div key={c._id} className="card lift fade-up p-6" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="flex items-center justify-between">
                <span className="badge badge-success">Verified</span>
                <span className="text-xs text-muted">{formatDate(c.issuedAt)}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold leading-snug">{c.courseTitle}</h3>
              <p className="mt-1 text-sm text-muted">Issued To {c.recipientName}</p>
              <p className="mt-1 text-sm text-muted">
                Company: <span className="font-medium text-foreground">{c.companyName}</span>
              </p>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="font-mono text-xs text-muted">{c.serial}</span>
                <Link to={`/verify/${c.serial}`} className="text-sm font-semibold text-primary link-underline">
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
