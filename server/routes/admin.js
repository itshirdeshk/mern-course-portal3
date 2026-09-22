import { Router } from "express"
import mongoose from "mongoose"
import { Course } from "../models/Course.js"
import { Enrollment } from "../models/Enrollment.js"
import { Certificate } from "../models/Certificate.js"
import { User } from "../models/User.js"
import { requireAuth, requireAdmin } from "../middleware/auth.js"

const router = Router()
router.use(requireAuth, requireAdmin)

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Normalize an incoming course payload into the stored shape.
function normalizeCoursePayload(body) {
  const lectures = (body.lectures || []).map((l, i) => ({
    ...(l._id && mongoose.isValidObjectId(l._id) ? { _id: l._id } : {}),
    title: (l.title || "").trim(),
    description: (l.description || "").trim(),
    videoUrl: (l.videoUrl || "").trim(),
    durationSeconds: Number(l.durationSeconds) || 0,
    order: i,
  }))

  const questions = (body.quiz?.questions || []).map((q) => ({
    ...(q._id && mongoose.isValidObjectId(q._id) ? { _id: q._id } : {}),
    prompt: (q.prompt || "").trim(),
    options: (q.options || []).map((o) => (o || "").trim()).filter(Boolean),
    correctIndex: Number(q.correctIndex) || 0,
  }))

  return {
    title: (body.title || "").trim(),
    subtitle: (body.subtitle || "").trim(),
    description: (body.description || "").trim(),
    category: (body.category || "General").trim(),
    level: body.level || "Beginner",
    coverImage: (body.coverImage || "").trim(),
    instructor: (body.instructor || "").trim(),
    companyName: (body.companyName || "LearnForge").trim(),
    published: Boolean(body.published),
    lectures,
    quiz: {
      passingScore: Number(body.quiz?.passingScore) || 70,
      questions,
    },
  }
}

// Dashboard summary metrics.
router.get("/stats", async (req, res) => {
  const [students, courses, pendingReviews, certificates] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Course.countDocuments({}),
    Enrollment.countDocuments({ "linkedin.status": "pending" }),
    Certificate.countDocuments({}),
  ])
  res.json({ students, courses, pendingReviews, certificates })
})

// ----- Courses -----
router.get("/courses", async (req, res) => {
  const courses = await Course.find({}).sort({ createdAt: -1 }).lean()
  res.json({ courses })
})

router.get("/courses/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid Id" })
  const course = await Course.findById(req.params.id).lean()
  if (!course) return res.status(404).json({ error: "Course Not Found" })
  res.json({ course })
})

router.post("/courses", async (req, res) => {
  try {
    const data = normalizeCoursePayload(req.body)
    if (!data.title) return res.status(400).json({ error: "Course Title Is Required" })

    let slug = slugify(body_or_title(req.body, data.title))
    // Ensure unique slug.
    let candidate = slug
    let n = 1
    while (await Course.exists({ slug: candidate })) {
      candidate = `${slug}-${n++}`
    }
    const course = await Course.create({ ...data, slug: candidate })
    res.status(201).json({ course })
  } catch (err) {
    console.log("[v0] create course error:", err.message)
    res.status(500).json({ error: "Could Not Create Course" })
  }
})

function body_or_title(body, title) {
  return (body.slug && body.slug.trim()) || title
}

router.put("/courses/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid Id" })
    const data = normalizeCoursePayload(req.body)
    if (!data.title) return res.status(400).json({ error: "Course Title Is Required" })

    const course = await Course.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!course) return res.status(404).json({ error: "Course Not Found" })
    res.json({ course })
  } catch (err) {
    console.log("[v0] update course error:", err.message)
    res.status(500).json({ error: "Could Not Update Course" })
  }
})

router.delete("/courses/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid Id" })
  await Course.findByIdAndDelete(req.params.id)
  await Enrollment.deleteMany({ course: req.params.id })
  res.json({ deleted: true })
})

// ----- LinkedIn submissions review -----
router.get("/submissions", async (req, res) => {
  const status = req.query.status || "pending"
  const query = status === "all" ? { "linkedin.status": { $ne: "none" } } : { "linkedin.status": status }
  const enrollments = await Enrollment.find(query)
    .populate("user", "name email")
    .populate("course", "title slug companyName")
    .sort({ "linkedin.submittedAt": -1 })
    .lean()

  res.json({
    submissions: enrollments.map((e) => ({
      id: e._id.toString(),
      student: e.user ? { name: e.user.name, email: e.user.email } : null,
      course: e.course ? { title: e.course.title, slug: e.course.slug, companyName: e.course.companyName } : null,
      linkedin: e.linkedin,
      quizPassed: e.quizPassed,
      bestScore: e.bestScore,
    })),
  })
})

router.post("/submissions/:id/review", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid Id" })
  const decision = req.body.decision // 'approved' | 'rejected'
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Decision Must Be Approved Or Rejected" })
  }

  const enrollment = await Enrollment.findById(req.params.id)
  if (!enrollment) return res.status(404).json({ error: "Submission Not Found" })

  enrollment.linkedin.status = decision
  enrollment.linkedin.reviewNote = (req.body.reviewNote || "").trim()
  enrollment.linkedin.reviewedAt = new Date()
  await enrollment.save()

  res.json({ linkedin: enrollment.linkedin })
})

// ----- Students -----
router.get("/students", async (req, res) => {
  const students = await User.find({ role: "student" }).sort({ createdAt: -1 }).lean()
  const ids = students.map((s) => s._id)
  const enrollments = await Enrollment.find({ user: { $in: ids } })
    .populate("course", "title")
    .lean()

  const byUser = new Map()
  for (const e of enrollments) {
    const key = e.user.toString()
    if (!byUser.has(key)) byUser.set(key, [])
    byUser.get(key).push(e)
  }

  res.json({
    students: students.map((s) => {
      const es = byUser.get(s._id.toString()) || []
      return {
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
        enrollments: es.length,
        certificates: es.filter((e) => e.certificateIssued).length,
      }
    }),
  })
})

export default router
