import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student", index: true },
    headline: { type: String, default: "" },
  },
  { timestamps: true },
)

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    headline: this.headline,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.models.User || mongoose.model("User", userSchema)
