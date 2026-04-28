import { Link } from "react-router-dom"
import { Activity } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-card mt-auto">
      <div className="container mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-8 gap-y-12">
          <div className="col-span-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Activity className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">HealthCore</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Empowering better healthcare through secure, modern, and accessible digital solutions for patients and providers alike.
            </p>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Platform</h3>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors block">About Us</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors block">Services</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors block">Contact</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Legal</h3>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors block">Privacy</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors block">Terms</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors block">HIPAA</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Portals</h3>
            <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
              <li><Link to="/patient/login" className="hover:text-primary transition-colors block">Patient</Link></li>
              <li><Link to="/physician/login" className="hover:text-primary transition-colors block">Physician</Link></li>
              <li><Link to="/admin/login" className="hover:text-primary transition-colors block">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HealthCore. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-primary transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-primary transition-colors">LinkedIn</Link>
            <Link to="#" className="hover:text-primary transition-colors">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
