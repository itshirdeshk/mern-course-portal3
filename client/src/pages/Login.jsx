import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { Spinner } from "@/components/Spinner"
import AuthShell from "@/components/AuthShell"

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      const user = await login(email, password)
      toast.success("Welcome Back!")
      const from = location.state?.from
      navigate(from || (user.role === "admin" ? "/admin" : "/dashboard"), { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign In To Continue Your Learning Journey."
      footer={
        <>
          New To LearnForge?{" "}
          <Link to="/register" className="font-semibold text-primary link-underline">
            Create An Account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2 py-3" disabled={busy}>
          {busy ? <Spinner /> : "Sign In"}
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-border bg-surface-2 p-4 text-xs text-muted">
        <p className="font-semibold text-foreground">Demo Accounts</p>
        <p className="mt-1">Admin: admin@learnforge.dev / admin123</p>
        <p>Student: student@learnforge.dev / student123</p>
      </div>
    </AuthShell>
  )
}
