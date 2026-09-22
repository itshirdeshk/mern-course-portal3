import { forwardRef } from "react"
import { Logo } from "@/components/Logo"

function formatDate(d) {
  if (!d) return ""
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

// Fixed template, dynamic recipient/course/serial. Rendered at a stable
// aspect ratio so it looks identical for every student.
const CertificateTemplate = forwardRef(function CertificateTemplate({ cert }, ref) {
  return (
    <div
      ref={ref}
      className="relative mx-auto w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "1.414 / 1",
        background: "linear-gradient(135deg, #12131f 0%, #1a1c2b 55%, #211f3d 100%)",
        border: "1px solid #2c2e40",
        color: "#eceef5",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40rem 40rem at 100% 0%, rgba(124,108,246,0.18), transparent 55%), radial-gradient(30rem 30rem at 0% 100%, rgba(245,196,81,0.12), transparent 55%)",
        }}
      />
      {/* Ornamental frame */}
      <div className="absolute inset-3 rounded-xl" style={{ border: "1px solid rgba(245,196,81,0.35)" }} />
      <div className="absolute inset-4 rounded-lg" style={{ border: "1px solid rgba(124,108,246,0.25)" }} />

      <div className="relative flex h-full flex-col items-center justify-between px-[7%] py-[5%] text-center">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-extrabold tracking-tight">LearnForge</span>
          </div>
          <span
            className="rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
            style={{ background: "rgba(245,196,81,0.14)", color: "#f5c451" }}
          >
            Verified Credential
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#9297ad]">
            Certificate Of Completion
          </p>
          <p className="text-sm text-[#9297ad]">This Is Proudly Presented To</p>
          <h1
            className="px-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "#ffffff" }}
          >
            {cert.recipientName}
          </h1>
          <div className="mx-auto h-px w-40" style={{ background: "rgba(245,196,81,0.5)" }} />
          <p className="max-w-xl text-sm leading-relaxed text-[#c6c9d8]">
            For Successfully Completing All Lectures, Passing The Final Assessment, And Sharing Their Achievement For{" "}
            <span className="font-semibold text-white">{cert.courseTitle}</span> Offered By{" "}
            <span className="font-semibold" style={{ color: "#f5c451" }}>
              {cert.companyName}
            </span>
            .
          </p>
        </div>

        <div className="flex w-full items-end justify-between text-left">
          <div>
            <p className="text-sm font-semibold text-white">{formatDate(cert.issuedAt)}</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-[#9297ad]">Date Issued</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-[0.6rem] font-bold uppercase"
              style={{
                background: "conic-gradient(from 0deg, #f5c451, #7c6cf6, #f5c451)",
                color: "#12131f",
              }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#12131f] text-[#f5c451]">
                Seal
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{cert.finalScore}%</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-[#9297ad]">Final Score</p>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-2 left-0 right-0 text-center text-[0.6rem] tracking-widest text-[#6b6f85]"
      >
        Serial {cert.serial} · Verify At /Verify/{cert.serial}
      </div>
    </div>
  )
})

export default CertificateTemplate
