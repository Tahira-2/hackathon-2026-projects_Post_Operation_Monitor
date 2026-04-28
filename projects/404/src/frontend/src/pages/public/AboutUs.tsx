import { Activity, ShieldCheck, HeartPulse, Stethoscope, ChevronRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function AboutUs() {
  return (
    <div className="bg-white">
      <main className="pb-20">
        <section className="px-6 md:px-10 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                  Our Mission
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl leading-[1.1]">
                  Managing health should be <span className="text-emerald-600 italic">effortless.</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                  HealthCore was founded on the belief that healthcare technology shouldn't be a barrier. We bring everything together in one secure ecosystem, empowering patients and clinicians alike.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="lg" className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-12 px-8">
                    <Link to="/patient/signup">Join the Journey</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 h-12 px-8">
                    <Link to="/services">View Solutions</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-emerald-100/50 blur-3xl" />
                <div className="relative aspect-square rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-2xl shadow-emerald-900/5 flex items-center justify-center overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="space-y-4">
                      <div className="h-32 rounded-2xl bg-emerald-50 flex items-center justify-center">
                        <Activity className="h-8 w-8 text-emerald-600" />
                      </div>
                      <div className="h-48 rounded-2xl bg-slate-900 flex items-center justify-center">
                        <ShieldCheck className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-8">
                      <div className="h-48 rounded-2xl bg-emerald-600 flex items-center justify-center">
                        <HeartPulse className="h-10 w-10 text-white" />
                      </div>
                      <div className="h-32 rounded-2xl bg-emerald-100 flex items-center justify-center">
                        <Stethoscope className="h-8 w-8 text-emerald-700" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl border border-emerald-900/10 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Uncompromising Security</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  Our platform is built strictly to HIPAA and GDPR standards, ensuring that patient data is fortified natively inside an encrypted architecture.
                </p>
              </div>
              <div className="p-8 rounded-3xl border border-emerald-900/10 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <HeartPulse className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Empowered Patients</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  View your medical history, message providers, and book visits in seconds. We make sure you never feel out of the loop with your own health.
                </p>
              </div>
              <div className="p-8 rounded-3xl border border-emerald-900/10 bg-white shadow-sm transition-all hover:shadow-md">
                <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                  <Stethoscope className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Streamlined Workflows</h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  For physicians, our dashboard cuts down administration overhead by 40%, letting medical teams focus completely on clinical precision over paperwork.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 px-6 md:px-10 lg:px-12 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl tracking-tight">Ready to upgrade your healthcare experience?</h2>
            <Link to="/patient/signup" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-600/20">
               Get Started Now <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
