import { Link } from "react-router-dom"
import { Activity, ShieldCheck, HeartPulse, Stethoscope, ChevronRight } from "lucide-react"

export function AboutUs() {
  return (
    <div className="flex-1 w-full flex flex-col">
      <section className="bg-primary/5 py-24 text-center">
        <div className="container px-4 mx-auto max-w-4xl space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Next-Generation Healthcare, <span className="text-primary">Simplified.</span></h1>
          <p className="text-xl text-muted-foreground">We believe that managing your health should be just as effortless as living it. HealthCore brings everything together in one secure ecosystem.</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold">Uncompromising Security</h3>
              <p className="text-muted-foreground leading-relaxed">Our platform is built strictly to HIPAA and GDPR standards, ensuring that patient data is fortified natively inside an encrypted architecture.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold">Empowered Patients</h3>
              <p className="text-muted-foreground leading-relaxed">View your medical history, message providers, and book visits in seconds. We make sure you never feel out of the loop with your own health.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">Streamlined Workflows</h3>
              <p className="text-muted-foreground leading-relaxed">For physicians, our dashboard cuts down administration overhead by 40%, letting medical teams focus completely on clinical precision over paperwork.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-primary text-primary-foreground py-20 text-center">
         <h2 className="text-3xl font-bold mb-4">Ready to upgrade your experience?</h2>
         <Link to="/patient/signup" className="inline-flex items-center gap-2 bg-background text-primary px-6 py-3 rounded-md font-semibold mt-4 hover:bg-muted transition-colors">
            Get Started <ChevronRight className="h-4 w-4" />
         </Link>
      </section>
    </div>
  )
}
