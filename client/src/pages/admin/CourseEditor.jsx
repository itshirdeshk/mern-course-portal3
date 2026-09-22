import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { api } from "@/lib/api"
import { useToast } from "@/context/ToastContext"
import { PageLoader, Spinner } from "@/components/Spinner"

const EMPTY = {
  title: "",
  subtitle: "",
  description: "",
  category: "Development",
  level: "Beginner",
  coverImage: "",
  instructor: "",
  companyName: "LearnForge",
  published: true,
  lectures: [],
  quiz: { passingScore: 70, questions: [] },
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export default function CourseEditor() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let active = true
    api(`/admin/courses/${id}`)
      .then((res) => {
        if (!active) return
        const c = res.course
        setForm({
          title: c.title || "",
          subtitle: c.subtitle || "",
          description: c.description || "",
          category: c.category || "Development",
          level: c.level || "Beginner",
          coverImage: c.coverImage || "",
          instructor: c.instructor || "",
          companyName: c.companyName || "LearnForge",
          published: Boolean(c.published),
          lectures: (c.lectures || []).map((l) => ({
            _id: l._id,
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            durationSeconds: l.durationSeconds,
          })),
          quiz: {
            passingScore: c.quiz?.passingScore || 70,
            questions: (c.quiz?.questions || []).map((q) => ({
              _id: q._id,
              prompt: q.prompt,
              options: q.options.length ? q.options : ["", ""],
              correctIndex: q.correctIndex || 0,
            })),
          },
        })
      })
      .catch((err) => toast.error(err.message))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // ---- Lectures ----
  function addLecture() {
    set("lectures", [...form.lectures, { title: "", description: "", videoUrl: "", durationSeconds: 0 }])
  }
  function updateLecture(i, key, value) {
    const next = form.lectures.slice()
    next[i] = { ...next[i], [key]: value }
    set("lectures", next)
  }
  function removeLecture(i) {
    set("lectures", form.lectures.filter((_, idx) => idx !== i))
  }
  function moveLecture(i, dir) {
    const j = i + dir
    if (j < 0 || j >= form.lectures.length) return
    const next = form.lectures.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    set("lectures", next)
  }

  // ---- Quiz ----
  function addQuestion() {
    set("quiz", {
      ...form.quiz,
      questions: [...form.quiz.questions, { prompt: "", options: ["", "", "", ""], correctIndex: 0 }],
    })
  }
  function updateQuestion(qi, key, value) {
    const questions = form.quiz.questions.slice()
    questions[qi] = { ...questions[qi], [key]: value }
    set("quiz", { ...form.quiz, questions })
  }
  function updateOption(qi, oi, value) {
    const questions = form.quiz.questions.slice()
    const options = questions[qi].options.slice()
    options[oi] = value
    questions[qi] = { ...questions[qi], options }
    set("quiz", { ...form.quiz, questions })
  }
  function addOption(qi) {
    const questions = form.quiz.questions.slice()
    questions[qi] = { ...questions[qi], options: [...questions[qi].options, ""] }
    set("quiz", { ...form.quiz, questions })
  }
  function removeOption(qi, oi) {
    const questions = form.quiz.questions.slice()
    const options = questions[qi].options.filter((_, idx) => idx !== oi)
    let correctIndex = questions[qi].correctIndex
    if (correctIndex >= options.length) correctIndex = 0
    questions[qi] = { ...questions[qi], options, correctIndex }
    set("quiz", { ...form.quiz, questions })
  }
  function removeQuestion(qi) {
    set("quiz", { ...form.quiz, questions: form.quiz.questions.filter((_, idx) => idx !== qi) })
  }

  function validate() {
    if (!form.title.trim()) return "Course Title Is Required"
    if (!form.companyName.trim()) return "Company Name Is Required"
    if (form.lectures.length === 0) return "Add At Least One Lecture"
    for (const [i, l] of form.lectures.entries()) {
      if (!l.title.trim()) return `Lecture ${i + 1} Needs A Title`
      if (!l.videoUrl.trim()) return `Lecture ${i + 1} Needs A Video URL`
    }
    for (const [i, q] of form.quiz.questions.entries()) {
      if (!q.prompt.trim()) return `Question ${i + 1} Needs A Prompt`
      const filled = q.options.filter((o) => o.trim())
      if (filled.length < 2) return `Question ${i + 1} Needs At Least Two Options`
    }
    return null
  }

  async function save() {
    const err = validate()
    if (err) return toast.error(err)
    setSaving(true)
    try {
      if (isEdit) {
        await api(`/admin/courses/${id}`, { method: "PUT", body: form })
        toast.success("Course Updated")
      } else {
        await api("/admin/courses", { method: "POST", body: form })
        toast.success("Course Created")
      }
      navigate("/admin/courses")
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading Course" />

  return (
    <div className="max-w-3xl">
      <Link to="/admin/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        ← Back To Courses
      </Link>
      <h2 className="mb-6 text-2xl font-bold">{isEdit ? "Edit Course" : "Create Course"}</h2>

      {/* Details */}
      <section className="card mb-5 p-6">
        <h3 className="mb-4 text-lg font-bold">Course Details</h3>
        <div className="flex flex-col gap-4">
          <Field label="Title">
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <input className="input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </Field>
          <Field label="Description">
            <textarea
              className="input min-h-24 resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <input className="input" value={form.category} onChange={(e) => set("category", e.target.value)} />
            </Field>
            <Field label="Level">
              <select className="input" value={form.level} onChange={(e) => set("level", e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </Field>
            <Field label="Instructor">
              <input className="input" value={form.instructor} onChange={(e) => set("instructor", e.target.value)} />
            </Field>
            <Field label="Company To Tag" hint="Students Must Tag This Company On LinkedIn.">
              <input className="input" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </Field>
          </div>
          <Field label="Cover Image URL" hint="Optional. Leave Blank For A Generated Gradient.">
            <input className="input" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
          </Field>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--color-primary)]"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            <span className="text-sm font-medium">Published (Visible To Students)</span>
          </label>
        </div>
      </section>

      {/* Lectures */}
      <section className="card mb-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Lectures</h3>
          <span className="text-xs text-muted">{form.lectures.length} Total · Order Matters</span>
        </div>
        <div className="flex flex-col gap-4">
          {form.lectures.map((l, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge badge-muted">Lecture {i + 1}</span>
                <div className="flex gap-1">
                  <button className="btn btn-ghost h-7 w-7 p-0" onClick={() => moveLecture(i, -1)} disabled={i === 0} aria-label="Move Up">
                    ↑
                  </button>
                  <button
                    className="btn btn-ghost h-7 w-7 p-0"
                    onClick={() => moveLecture(i, 1)}
                    disabled={i === form.lectures.length - 1}
                    aria-label="Move Down"
                  >
                    ↓
                  </button>
                  <button className="btn btn-ghost h-7 px-2 text-xs text-danger hover:bg-danger/10" onClick={() => removeLecture(i)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  className="input"
                  placeholder="Lecture Title"
                  value={l.title}
                  onChange={(e) => updateLecture(i, "title", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Video URL (YouTube Or MP4)"
                  value={l.videoUrl}
                  onChange={(e) => updateLecture(i, "videoUrl", e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                  <input
                    className="input"
                    placeholder="Short Description"
                    value={l.description}
                    onChange={(e) => updateLecture(i, "description", e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="Duration (Sec)"
                    value={l.durationSeconds || ""}
                    onChange={(e) => updateLecture(i, "durationSeconds", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary mt-4" onClick={addLecture}>
          + Add Lecture
        </button>
      </section>

      {/* Quiz */}
      <section className="card mb-5 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold">Assessment</h3>
          <label className="flex items-center gap-2 text-sm">
            Passing Score
            <input
              type="number"
              min="1"
              max="100"
              className="input h-9 w-20"
              value={form.quiz.passingScore}
              onChange={(e) => set("quiz", { ...form.quiz, passingScore: Number(e.target.value) })}
            />
            %
          </label>
        </div>
        <div className="flex flex-col gap-4">
          {form.quiz.questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="badge badge-muted">Question {qi + 1}</span>
                <button className="btn btn-ghost h-7 px-2 text-xs text-danger hover:bg-danger/10" onClick={() => removeQuestion(qi)}>
                  Remove
                </button>
              </div>
              <input
                className="input mb-3"
                placeholder="Question Prompt"
                value={q.prompt}
                onChange={(e) => updateQuestion(qi, "prompt", e.target.value)}
              />
              <p className="mb-2 text-xs text-muted">Select The Radio Button Next To The Correct Answer.</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      className="h-4 w-4 accent-[var(--color-success)]"
                      checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(qi, "correctIndex", oi)}
                      aria-label={`Mark Option ${oi + 1} Correct`}
                    />
                    <input
                      className="input"
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                    />
                    {q.options.length > 2 && (
                      <button
                        className="btn btn-ghost h-9 w-9 shrink-0 p-0 text-danger hover:bg-danger/10"
                        onClick={() => removeOption(qi, oi)}
                        aria-label="Remove Option"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {q.options.length < 6 && (
                <button className="btn btn-ghost mt-3 h-8 px-3 text-xs" onClick={() => addOption(qi)}>
                  + Add Option
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="btn btn-secondary mt-4" onClick={addQuestion}>
          + Add Question
        </button>
      </section>

      <div className="sticky bottom-4">
        <div className="card glass flex items-center justify-between p-4">
          <Link to="/admin/courses" className="btn btn-ghost">
            Cancel
          </Link>
          <button className="btn btn-primary px-6" onClick={save} disabled={saving}>
            {saving ? <Spinner /> : isEdit ? "Save Changes" : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  )
}
