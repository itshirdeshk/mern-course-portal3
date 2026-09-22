import mongoose from "mongoose"

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    order: { type: Number, required: true },
  },
  { _id: true },
)

const questionSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: {
      type: [String],
      validate: [(v) => v.length >= 2 && v.length <= 6, "A question needs 2 to 6 options"],
    },
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: true },
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    coverImage: { type: String, default: "" },
    instructor: { type: String, default: "" },
    // The company students must tag on LinkedIn to unlock the certificate.
    companyName: { type: String, required: true, default: "LearnForge" },
    lectures: { type: [lectureSchema], default: [] },
    quiz: {
      passingScore: { type: Number, default: 70 },
      questions: { type: [questionSchema], default: [] },
    },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

courseSchema.virtual("lectureCount").get(function () {
  return this.lectures.length
})

courseSchema.set("toJSON", { virtuals: true })

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema)
