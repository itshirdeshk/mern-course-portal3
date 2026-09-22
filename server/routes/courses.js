import { Router } from "express"
import mongoose from "mongoose"
import { Course } from "../models/Course.js"
import { Enrollment } from "../models/Enrollment.js"
import { Certificate } from "../models/Certificate.js"
import { requireAuth } from "../middleware/auth.js"
import { buildLectureState, computeGate, nextUnlockedLectureId } from "../lib/progress.js"

const router = Router()

function makeSerial() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  const stamp = Date.now().toString(36).slice(-4).toUpperCase()
  return `LF-${stamp}-${rand}`
}

// Public course catalog (published only), with a light shape for cards.
router.get("/", async (req, res) => {
  const courses = await Course.find({ published: true }).sort({ createdAt: -1 }).lean()
  res.json({
    courses: courses.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      subtitle: c.subtitle,
      description: c.description,
      category: c.category,
      level: c.level,
      coverImage: c.coverImage,
      instructor: c.instructor,
      companyName: c.companyName,
      lectureCount: c.lectures.length,
      quizQuestionCount: c.quiz?.questions?.length || 0,
    })),
  })
})

async function loadCourseBySlug(slug) {
  return Course.findOne({ slug: slug.toLowerCase(), published: true })
}

// Detailed course view for an authenticated student, including their progress
// and the certificate gate. Quiz answers are never exposed here.
router.get("/:slug", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })

  const state = buildLectureState(course, enrollment)
  const gate = computeGate(course, enrollment)

  res.json({
    course: {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      subtitle: course.subtitle,
      description: course.description,
      category: course.category,
      level: course.level,
      coverImage: course.coverImage,
      instructor: course.instructor,
      companyName: course.companyName,
      quiz: {
        passingScore: course.quiz.passingScore,
        questionCount: course.quiz.questions.length,
      },
    },
    enrolled: Boolean(enrollment),
    progress: state,
    gate,
    linkedin: enrollment?.linkedin || { status: "none", url: "" },
    quizPassed: enrollment?.quizPassed || false,
    bestScore: enrollment?.bestScore || 0,
    certificateIssued: enrollment?.certificateIssued || false,
  })
})

router.post("/:slug/enroll", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  if (!enrollment) {
    enrollment = await Enrollment.create({ user: req.user._id, course: course._id })
  }
  res.status(201).json({ enrolled: true })
})

// Mark a lecture complete. Enforces sequential progress: the lecture being
// completed must be currently unlocked (no skipping ahead).
router.post("/:slug/lectures/:lectureId/complete", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  const lectureId = req.params.lectureId
  if (!mongoose.isValidObjectId(lectureId)) return res.status(400).json({ error: "Invalid Lecture" })

  const lecture = course.lectures.id(lectureId)
  if (!lecture) return res.status(404).json({ error: "Lecture Not Found" })

  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  if (!enrollment) enrollment = await Enrollment.create({ user: req.user._id, course: course._id })

  const state = buildLectureState(course, enrollment)
  const target = state.lectures.find((l) => l.id === lectureId)

  if (!target.unlocked) {
    return res.status(403).json({ error: "Finish The Previous Lectures First" })
  }

  if (!target.completed) {
    enrollment.completedLectures.push(lecture._id)
    await enrollment.save()
  }

  const newState = buildLectureState(course, enrollment)
  const gate = computeGate(course, enrollment)
  res.json({ progress: newState, gate, nextLectureId: nextUnlockedLectureId(course, enrollment) })
})

// Fetch quiz questions (without correct answers) once lectures are complete.
router.get("/:slug/quiz", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  const state = buildLectureState(course, enrollment)
  if (!state.allLecturesComplete) {
    return res.status(403).json({ error: "Complete All Lectures To Unlock The Quiz" })
  }

  res.json({
    passingScore: course.quiz.passingScore,
    questions: course.quiz.questions.map((q) => ({
      id: q._id.toString(),
      prompt: q.prompt,
      options: q.options,
    })),
    quizPassed: enrollment?.quizPassed || false,
    bestScore: enrollment?.bestScore || 0,
  })
})

// Grade a quiz submission server-side. Answers are validated against stored keys.
router.post("/:slug/quiz", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  if (!enrollment) enrollment = await Enrollment.create({ user: req.user._id, course: course._id })

  const state = buildLectureState(course, enrollment)
  if (!state.allLecturesComplete) {
    return res.status(403).json({ error: "Complete All Lectures To Take The Quiz" })
  }

  const answers = req.body.answers || {} // { [questionId]: optionIndex }
  const questions = course.quiz.questions
  if (questions.length === 0) return res.status(400).json({ error: "This Course Has No Quiz" })

  let correct = 0
  const perQuestion = questions.map((q) => {
    const picked = answers[q._id.toString()]
    const isCorrect = Number(picked) === q.correctIndex
    if (isCorrect) correct += 1
    return { id: q._id.toString(), correct: isCorrect }
  })

  const score = Math.round((correct / questions.length) * 100)
  const passed = score >= course.quiz.passingScore

  enrollment.quizAttempts.push({
    score,
    passed,
    correctCount: correct,
    totalQuestions: questions.length,
  })
  enrollment.bestScore = Math.max(enrollment.bestScore || 0, score)
  if (passed) enrollment.quizPassed = true
  await enrollment.save()

  res.json({
    score,
    passed,
    correctCount: correct,
    totalQuestions: questions.length,
    passingScore: course.quiz.passingScore,
    perQuestion,
    gate: computeGate(course, enrollment),
  })
})

// Submit a LinkedIn post URL for admin review.
router.post("/:slug/linkedin", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  const url = (req.body.url || "").trim()
  const linkedinRe = /^https?:\/\/(?:[\w-]+\.)?(?:linkedin\.com|lnkd\.in)\/.+/i
  if (!linkedinRe.test(url)) {
    return res.status(400).json({ error: "Please Enter A Valid LinkedIn Post URL" })
  }

  let enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  if (!enrollment) enrollment = await Enrollment.create({ user: req.user._id, course: course._id })

  if (enrollment.linkedin.status === "approved") {
    return res.status(409).json({ error: "Your Submission Is Already Approved" })
  }

  enrollment.linkedin = {
    url,
    status: "pending",
    reviewNote: "",
    submittedAt: new Date(),
  }
  await enrollment.save()

  res.json({ linkedin: enrollment.linkedin, gate: computeGate(course, enrollment) })
})

// Claim the certificate once every requirement is met.
router.post("/:slug/certificate", requireAuth, async (req, res) => {
  const course = await loadCourseBySlug(req.params.slug)
  if (!course) return res.status(404).json({ error: "Course Not Found" })

  const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id })
  const gate = computeGate(course, enrollment)
  if (!gate.eligible) {
    return res.status(403).json({ error: "You Have Not Met All Requirements Yet", gate })
  }

  if (enrollment.certificateIssued && enrollment.certificate) {
    const existing = await Certificate.findById(enrollment.certificate).lean()
    if (existing) return res.json({ certificate: existing })
  }

  const cert = await Certificate.create({
    serial: makeSerial(),
    user: req.user._id,
    course: course._id,
    recipientName: req.user.name,
    courseTitle: course.title,
    companyName: course.companyName,
    finalScore: enrollment.bestScore || 0,
  })

  enrollment.certificateIssued = true
  enrollment.certificate = cert._id
  await enrollment.save()

  res.status(201).json({ certificate: cert.toObject() })
})

// A student's issued certificates.
router.get("/me/certificates", requireAuth, async (req, res) => {
  const certs = await Certificate.find({ user: req.user._id }).sort({ issuedAt: -1 }).lean()
  res.json({ certificates: certs })
})

export default router
