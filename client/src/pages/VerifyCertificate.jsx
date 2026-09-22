import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { Spinner } from "@/components/Spinner"
import CertificateTemplate from "@/components/CertificateTemplate"

export default function VerifyCertificate() {
  const { serial: serialParam } = useParams()
  const toast = useToast()
  const [serial, setSerial] = useState(serialParam || "")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)
  const certRef = useRef(null)

  async function verify(value) {
    const s = (value ?? serial).trim()
    if (!s) return
    setBusy(true)
    setSearched(true)
    try {
      const res = await api(`/certificates/${encodeURIComponent(s)}`, { auth: false })
      setResult(res.certificate)
    } catch {
      setResult(null)
      toast.error("No Certificate Found With That Serial")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (serialParam) verify(serialParam)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialParam])

  return (
    <div className="container-page max-w-4xl py-12">
      <div className="fade-up mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Verify A Certificate</h1>
        <p className="mt-2 text-muted">Enter A Certificate Serial Number To Confirm Its Authenticity.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          verify()
        }}
        className="mx-auto flex max-w-lg gap-3"
      >
        <input
          className="input font-mono"
          placeholder="LF-XXXX-XXXXXX"
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
        />
        <button className="btn btn-primary shrink-0 px-6" disabled={busy}>
          {busy ? <Spinner /> : "Verify"}
        </button>
      </form>

      {searched && !busy && !result && (
        <div className="card fade-up mx-auto mt-8 max-w-lg border-danger/50 p-6 text-center">
          <p className="font-semibold text-danger">Certificate Not Found</p>
          <p className="mt-1 text-sm text-muted">Please Check The Serial Number And Try Again.</p>
        </div>
      )}

      {result && (
        <div className="fade-up mt-10">
          <div className="mx-auto mb-5 flex max-w-md items-center justify-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm font-semibold">This Is A Valid, Verified Certificate</span>
          </div>
          <div className="rounded-2xl p-2 shadow-2xl">
            <CertificateTemplate ref={certRef} cert={result} />
          </div>
        </div>
      )}
    </div>
  )
}
