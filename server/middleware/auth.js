import jwt from "jsonwebtoken"
import { User } from "../models/User.js"

const JWT_SECRET = process.env.JWT_SECRET || "learnforge-dev-secret-change-me"
const JWT_EXPIRES = "7d"

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  })
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: "Authentication required" })

    const payload = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: "Account no longer exists" })

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session" })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Administrator access required" })
  }
  next()
}
