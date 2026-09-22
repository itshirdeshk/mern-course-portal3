import mongoose from "mongoose"

// Public, verifiable certificate record. Name and course are snapshotted
// (extended reference pattern) so the certificate stays valid even if the
// source records change later.
const certificateSchema = new mongoose.Schema(
  {
    serial: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    recipientName: { type: String, required: true },
    courseTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    finalScore: { type: Number, default: 0 },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema)
