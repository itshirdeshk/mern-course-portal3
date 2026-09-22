import { Router } from "express"
import { Certificate } from "../models/Certificate.js"

const router = Router()

// Public verification endpoint used by the verify page.
router.get("/:serial", async (req, res) => {
  const cert = await Certificate.findOne({ serial: req.params.serial.toUpperCase() }).lean()
  if (!cert) return res.status(404).json({ error: "Certificate Not Found" })
  res.json({
    certificate: {
      serial: cert.serial,
      recipientName: cert.recipientName,
      courseTitle: cert.courseTitle,
      companyName: cert.companyName,
      finalScore: cert.finalScore,
      issuedAt: cert.issuedAt,
    },
  })
})

export default router
