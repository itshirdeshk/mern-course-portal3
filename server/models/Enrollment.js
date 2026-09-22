import mongoose from "mongoose"

const quizAttemptSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    takenAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    // Ids of lectures the student has finished. Order is enforced in the API.
    completedLectures: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    quizAttempts: { type: [quizAttemptSchema], default: [] },
    quizPassed: { type: Boolean, default: false },
    bestScore: { type: Number, default: 0 },
    linkedin: {
      url: { type: String, default: "" },
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      reviewNote: { type: String, default: "" },
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
    },
    certificateIssued: { type: Boolean, default: false },
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  },
  { timestamps: true },
)

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

export const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema)
