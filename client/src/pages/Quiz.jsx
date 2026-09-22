import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader, Spinner } from "@/components/Spinner"

export default function Quiz() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let active = true
    api(`/courses/${slug}/quiz`)
      .then((res) => active && setQuiz(res))
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  function pick(questionId, optionIndex) {
    if (result) return
    setAnswers((a) => ({ ...a, [questionId]: optionIndex }))
  }

  async function handleSubmit() {
    if (submitting) return
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please Answer Every Question")
      return
    }
    setSubmitting(true)
    try {
      const res = await api(`/courses/${slug}/quiz`, { method: "POST", body: { answers } })
      setResult(res)
      if (res.passed) toast.success(`Passed With ${res.score}%`)
      else toast.error(`Scored ${res.score}% — Passing Is ${res.passingScore}%`)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function retry() {
    setAnswers({})
    setResult(null)
  }

  if (loading) return <PageLoader label="Loading Assessment" />
  if (error)
    return (
      <div className="container-page py-16">
        <div className="card border-danger/50 p-6 text-center">
          <p className="font-semibold text-danger">{error}</p>
          <Link to={`/learn/${slug}`} className="btn btn-ghost mt-4">
            Back To Course
          </Link>
        </div>
      </div>
    )

  const answeredCount = Object.keys(answers).length
  const resultCorrect = result ? new Map(result.perQuestion.map((p) => [p.id, p.correct])) : null

  return (
    <div className="container-page max-w-3xl py-8">
      <Link to={`/learn/${slug}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        ← Back To Course
      </Link>

      <div className="fade-up mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Final Assessment</h1>
        <p className="mt-1.5 text-muted">
          Answer All {quiz.questions.length} Questions. You Need {quiz.passingScore}% To Pass.
        </p>
      </div>

      {result && (
        <div
          className="card fade-up mb-6 p-6"
          style={{ borderColor: result.passed ? "var(--color-success)" : "var(--color-danger)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Your Score</p>
              <p
                className="text-4xl font-extrabold"
                style={{ color: result.passed ? "var(--color-success)" : "var(--color-danger)" }}
              >
                {result.score}%
              </p>
              <p className="mt-1 text-sm text-muted">
                {result.correctCount} Of {result.totalQuestions} Correct · Passing {result.passingScore}%
              </p>
            </div>
            <div className="flex gap-3">
              {result.passed ? (
                <button className="btn btn-accent" onClick={() => navigate(`/learn/${slug}`)}>
                  Continue To Requirements
                </button>
              ) : (
                <button className="btn btn-primary" onClick={retry}>
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="card fade-up p-6" style={{ animationDelay: `${qi * 0.04}s` }}>
            <p className="font-semibold">
              <span className="text-muted">{qi + 1}.</span> {q.prompt}
            </p>
            <div className="mt-4 flex flex-col gap-2.5">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi
                let stateCls = "border-border hover:border-primary/60 hover:bg-surface-2"
                if (result) {
                  const correct = resultCorrect.get(q.id)
                  if (selected && correct) stateCls = "border-success bg-success/10"
                  else if (selected && !correct) stateCls = "border-danger bg-danger/10"
                  else stateCls = "border-border opacity-70"
                } else if (selected) {
                  stateCls = "border-primary bg-primary-soft"
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => pick(q.id, oi)}
                    disabled={Boolean(result)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${stateCls}`}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                      style={{
                        borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                        background: selected ? "var(--color-primary)" : "transparent",
                        color: selected ? "#fff" : "var(--color-muted)",
                      }}
                    >
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!result && (
        <div className="sticky bottom-4 mt-6">
          <div className="card glass flex items-center justify-between p-4">
            <span className="text-sm text-muted">
              {answeredCount} Of {quiz.questions.length} Answered
            </span>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Spinner /> : "Submit Assessment"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
