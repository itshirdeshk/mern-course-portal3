import { Router } from "express"
import bcrypt from "bcryptjs"
import { User } from "../models/User.js"
import { signToken, requireAuth } from "../middleware/auth.js"

const router = Router()

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post("/register", async (req, res) => {
  try {
    const name = (req.body.name || "").trim()
    const email = (req.body.email || "").trim().toLowerCase()
    const password = req.body.password || ""

    if (!name || name.length < 2) return res.status(400).json({ error: "Please Enter Your Full Name" })
    if (!emailRe.test(email)) return res.status(400).json({ error: "Please Enter A Valid Email Address" })
    if (password.length < 6) return res.status(400).json({ error: "Password Must Be At Least 6 Characters" })

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: "An Account With This Email Already Exists" })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: "student" })

    const token = signToken(user)
    res.status(201).json({ token, user: user.toSafeJSON() })
  } catch (err) {
    console.log("[v0] register error:", err.message)
    res.status(500).json({ error: "Could Not Create Account" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase()
    const password = req.body.password || ""

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: "Invalid Email Or Password" })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: "Invalid Email Or Password" })

    const token = signToken(user)
    res.json({ token, user: user.toSafeJSON() })
  } catch (err) {
    console.log("[v0] login error:", err.message)
    res.status(500).json({ error: "Could Not Sign In" })
  }
})

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user.toSafeJSON() })
})

export default router
