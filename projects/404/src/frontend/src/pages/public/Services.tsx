import { ShieldCheck, Activity, Users, Database, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Services() {
  return (
    <div className="bg-white">
      <main className="pb-20">
        <section className="px-6 md:px-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-6 mb-16">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald-700">Our Solutions</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
                Infrastructure for the <span className="text-emerald-600">Future of Care</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                We provide a unified ecosystem for clinical documentation, patient communication, and operational efficiency, built on a foundation of security and transparency.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group p-8 rounded-3xl border border-emerald-900/10 bg-[#f7fbf8] transition-all hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-1">
                <div className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 flex mb-6 group-hover:scale-110 transition-transform">
                  <Activity className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Patient Electronic Records</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Secure, HIPAA-compliant access to complete digital health files instantly synced across care providers, giving patients sovereignty over their own data.
                </p>
                <Link to="/patient/signup" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="group p-8 rounded-3xl border border-emerald-900/10 bg-[#f7fbf8] transition-all hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-1">
                <div className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 flex mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Telemedicine & Appointments</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Schedule, manage, and execute remote telemedicine consults or in-person visits with automated calendar bindings and smart reminders.
                </p>
                <Link to="/patient/signup" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="group p-8 rounded-3xl border border-emerald-900/10 bg-[#f7fbf8] transition-all hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-1">
                <div className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 flex mb-6 group-hover:scale-110 transition-transform">
                  <Database className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Decentralized Storage</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Future-proofing medical records by migrating them off legacy systems onto highly redundant, encrypted storage nodes for lifetime permanence.
                </p>
                <Link to="/patient/signup" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="group p-8 rounded-3xl border border-emerald-900/10 bg-[#f7fbf8] transition-all hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-1">
                <div className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 flex mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Identity Access Management</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Strict role-based access defining precisely what an Admin, Physician, or Patient can observe and manipulate, guaranteeing privacy compliance.
                </p>
                <Link to="/patient/signup" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 px-6 md:px-10 lg:px-12">
          <div className="mx-auto max-w-7xl rounded-3xl bg-slate-900 p-8 md:p-16 text-center text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-transparent" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold md:text-4xl tracking-tight">Ready to transform your practice?</h2>
              <p className="text-slate-400 text-lg">Join hundreds of providers who are already using HealthCore to deliver better patient outcomes.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-12 px-8">
                  <Link to="/patient/signup">Get Started Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border-slate-700 text-white hover:bg-white/10 h-12 px-8">
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
