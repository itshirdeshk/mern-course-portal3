import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/auth.js"
import courseRoutes from "./routes/courses.js"
import adminRoutes from "./routes/admin.js"
import certificateRoutes from "./routes/certificates.js"

const app = express()
app.use(cors())
app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (req, res) => res.json({ ok: true }))

app.use("/api/auth", authRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/certificates", certificateRoutes)

app.use("/api", (req, res) => res.status(404).json({ error: "Not Found" }))

// Central error handler so route bugs return JSON, not stack traces.
app.use((err, req, res, next) => {
  console.log("[v0] unhandled error:", err.message)
  res.status(500).json({ error: "Something Went Wrong" })
})

const PORT = process.env.API_PORT || 3001

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[v0] API listening on :${PORT}`))
  })
  .catch((err) => {
    console.log("[v0] failed to connect to MongoDB:", err.message)
    // Still start the server so the client can surface a clear error.
    app.listen(PORT, () => console.log(`[v0] API listening on :${PORT} (no DB)`))
  })
