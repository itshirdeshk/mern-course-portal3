import { Link } from "react-router-dom"
import { Logo } from "@/components/Logo"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="font-bold">LearnForge</span>
          <span className="text-sm text-muted">— Learn. Prove. Get Certified.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link to="/verify" className="link-underline hover:text-foreground">
            Verify Certificate
          </Link>
          <span>© {new Date().getFullYear()} LearnForge</span>
        </div>
      </div>
    </footer>
  )
}
