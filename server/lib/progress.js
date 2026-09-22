// Pure helpers that compute a student's standing in a course from the
// course document and their enrollment. Kept free of DB calls so the same
// logic can be reused across routes and tested in isolation.

export function buildLectureState(course, enrollment) {
  const ordered = [...course.lectures].sort((a, b) => a.order - b.order)
  const completedSet = new Set((enrollment?.completedLectures || []).map((id) => id.toString()))

  let unlockedThrough = 0 // index up to which lectures are watchable
  const lectures = ordered.map((lec, index) => {
    const id = lec._id.toString()
    const completed = completedSet.has(id)
    // A lecture is unlocked if it is the first, already completed, or the
    // one immediately after the last completed lecture (no forward skipping).
    const unlocked = index <= unlockedThrough
    if (completed && index === unlockedThrough) unlockedThrough = index + 1
    return {
      id,
      title: lec.title,
      description: lec.description,
      videoUrl: lec.videoUrl,
      durationSeconds: lec.durationSeconds,
      order: lec.order,
      index,
      completed,
      unlocked,
    }
  })

  // Second pass to correctly mark unlocked based on the final unlockedThrough.
  for (let i = 0; i < lectures.length; i++) {
    lectures[i].unlocked = i <= unlockedThrough
  }

  const completedCount = lectures.filter((l) => l.completed).length
  const allLecturesComplete = ordered.length > 0 && completedCount === ordered.length

  return { lectures, completedCount, total: ordered.length, allLecturesComplete, unlockedThrough }
}

export function computeGate(course, enrollment) {
  const { allLecturesComplete, completedCount, total } = buildLectureState(course, enrollment)
  const quizPassed = Boolean(enrollment?.quizPassed)
  const linkedinApproved = enrollment?.linkedin?.status === "approved"
  const hasQuiz = (course.quiz?.questions?.length || 0) > 0

  const requirements = {
    lectures: { met: allLecturesComplete, completedCount, total },
    quiz: { met: hasQuiz ? quizPassed : true, hasQuiz, bestScore: enrollment?.bestScore || 0 },
    linkedin: { met: linkedinApproved, status: enrollment?.linkedin?.status || "none" },
  }

  const eligible = requirements.lectures.met && requirements.quiz.met && requirements.linkedin.met

  return { eligible, requirements, alreadyIssued: Boolean(enrollment?.certificateIssued) }
}

export function nextUnlockedLectureId(course, enrollment) {
  const { lectures, unlockedThrough } = buildLectureState(course, enrollment)
  const target = lectures[Math.min(unlockedThrough, lectures.length - 1)]
  return target?.id || null
}
