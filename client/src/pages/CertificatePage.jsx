import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { toPng } from "html-to-image"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader, Spinner } from "@/components/Spinner"
import CertificateTemplate from "@/components/CertificateTemplate"
import RequirementChecklist from "@/components/RequirementChecklist"

export default function CertificatePage() {
  const { slug } = useParams()
  const toast = useToast()
  const certRef = useRef(null)

  const [state, setState] = useState({ loading: true, error: "", data: null })
  const [cert, setCert] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function claim() {
    setClaiming(true)
    try {
      const res = await api(`/courses/${slug}/certificate`, { method: "POST" })
      setCert(res.certificate)
      toast.success("Certificate Unlocked!")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setClaiming(false)
    }
  }

  useEffect(() => {
    let active = true
    api(`/courses/${slug}`)
      .then((data) => {
        if (!active) return
        setState({ loading: false, error: "", data })
        if (data.gate.eligible) return claim()
      })
      .catch((err) => active && setState({ loading: false, error: err.message, data: null }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function download() {
    if (!certRef.current || downloading) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(certRef.current, { pixelRatio: 2, cacheBust: true })
      const link = document.createElement("a")
      link.download = `LearnForge-Certificate-${cert.serial}.png`
      link.href = dataUrl
      link.click()
      toast.success("Certificate Downloaded")
    } catch {
      toast.error("Could Not Generate Image")
    } finally {
      setDownloading(false)
    }
  }

  if (state.loading) return <PageLoader label="Checking Requirements" />
  if (state.error)
    return (
      <div className="container-page py-16">
        <div className="card border-danger/50 p-6 text-center">
          <p className="font-semibold text-danger">{state.error}</p>
          <Link to={`/learn/${slug}`} className="btn btn-ghost mt-4">
            Back To Course
          </Link>
        </div>
      </div>
    )

  const { gate, linkedin, course } = state.data

  if (!gate.eligible && !cert) {
    return (
      <div className="container-page max-w-2xl py-12">
        <Link to={`/learn/${slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          ← Back To Course
        </Link>
        <div className="card fade-up p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold">Certificate Locked</h1>
          <p className="mt-2 text-muted">Complete Every Requirement Below To Unlock Your Certificate.</p>
          <div className="mx-auto mt-6 max-w-sm text-left">
            <RequirementChecklist gate={gate} linkedin={linkedin} />
          </div>
          <Link to={`/learn/${slug}`} className="btn btn-primary mt-8">
            Continue The Course
          </Link>
        </div>
      </div>
    )
  }

  if (!cert) return <PageLoader label="Preparing Your Certificate" />

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="fade-up mb-6 text-center">
        <span className="badge badge-success mx-auto">Certificate Unlocked</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Congratulations, {cert.recipientName.split(" ")[0]}!</h1>
        <p className="mt-2 text-muted">
          You Earned Your Certificate For <span className="font-semibold text-foreground">{cert.courseTitle}</span>.
        </p>
      </div>

      <div className="fade-up rounded-2xl p-2 shadow-2xl" style={{ animationDelay: "0.08s" }}>
        <CertificateTemplate ref={certRef} cert={cert} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button className="btn btn-primary px-6 py-3" onClick={download} disabled={downloading}>
          {downloading ? <Spinner /> : "Download As PNG"}
        </button>
        <Link to="/my-certificates" className="btn btn-ghost px-6 py-3">
          View All My Certificates
        </Link>
        <Link to={`/verify/${cert.serial}`} className="btn btn-secondary px-6 py-3">
          Verify This Certificate
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Serial Number: <span className="font-mono font-semibold text-foreground">{cert.serial}</span>
      </p>
    </div>
  )
}
