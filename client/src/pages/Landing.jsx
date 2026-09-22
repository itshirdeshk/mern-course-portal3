import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

const steps = [
  {
    title: "Watch Every Lecture",
    body: "Move Through The Curriculum In Order. Lectures Unlock One After Another So You Never Miss A Concept.",
    icon: PlayIcon,
  },
  {
    title: "Pass The Assessment",
    body: "Prove What You Learned With A Focused Quiz. Clear The Passing Score To Advance.",
    icon: CheckIcon,
  },
  {
    title: "Share On LinkedIn",
    body: "Post About Your Achievement And Tag The Company. Our Reviewers Confirm Your Submission.",
    icon: ShareIcon,
  },
  {
    title: "Unlock Your Certificate",
    body: "Meet Every Requirement To Reveal A Verified, Shareable Certificate With Your Name On It.",
    icon: AwardIcon,
  },
]

export default function Landing() {
  const { user } = useAuth()
  const primaryTo = user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/register"

  return (
    <div>
      {/* Hero */}
      <section className="container-page relative pt-20 pb-24 text-center">
        <div className="fade-up mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Learn. Prove. Get Certified.
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
            Earn Certificates You Actually{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #8b7cff, #f5c451)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Have To Earn
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            LearnForge Guides You Through Lectures, A Real Assessment, And A Public Achievement Post — Then Unlocks A
            Verified Certificate Built Just For You.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to={primaryTo} className="btn btn-primary px-6 py-3 text-base">
              {user ? "Go To Your Portal" : "Start Learning Free"}
            </Link>
            <Link to="/verify" className="btn btn-ghost px-6 py-3 text-base">
              Verify A Certificate
            </Link>
          </div>
        </div>

        <div className="fade-up mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "0.1s" }}>
          {[
            ["100%", "Sequential Learning"],
            ["Real", "Graded Assessments"],
            ["Verified", "LinkedIn Review"],
            ["Unique", "Named Certificates"],
          ].map(([big, small]) => (
            <div key={small} className="card lift p-5 text-left">
              <p className="text-2xl font-extrabold text-foreground">{big}</p>
              <p className="mt-1 text-sm text-muted">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container-page pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">How The Certification Works</h2>
          <p className="mt-3 text-muted">Four Honest Steps Stand Between You And A Credential Worth Showing.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div
                key={s.title}
                className="card lift fade-up p-6"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">STEP {i + 1}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-28">
        <div className="card glass relative overflow-hidden p-10 text-center sm:p-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(30rem 30rem at 20% 0%, rgba(124,108,246,0.18), transparent 60%), radial-gradient(24rem 24rem at 90% 100%, rgba(245,196,81,0.12), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready To Prove Your Skills?</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted">
              Create Your Free Account And Start The Path To A Certificate That Means Something.
            </p>
            <Link to={primaryTo} className="btn btn-accent mt-8 px-7 py-3 text-base">
              {user ? "Continue" : "Create Your Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function AwardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
}
