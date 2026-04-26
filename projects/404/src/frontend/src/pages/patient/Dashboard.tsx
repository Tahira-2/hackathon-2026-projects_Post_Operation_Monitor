import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const PATIENT_NAME = "John"

const HERO_IMAGE_URL = "/doctor.png"
const WELLNESS_IMAGE_URL = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop"

export function PatientDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12 scroll-smooth">
      <section
        id="overview"
        className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 scroll-mt-36 overflow-hidden rounded-none border-b border-slate-200 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-700"
      >
        <div className="grid items-center gap-12 px-4 py-12 md:py-16 lg:py-20 md:grid-cols-[1.05fr_0.95fr] md:px-10 lg:px-12 xl:px-16 mx-auto max-w-7xl">
          <div className="order-2 flex flex-col justify-center space-y-7 md:order-1">
            <span className="inline-flex w-fit items-center rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 shadow-sm">
              Patient Care Home
            </span>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Hello, {PATIENT_NAME}</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-tight text-slate-900 md:text-6xl xl:text-7xl">
              Align Your Care
              <br />
              With Clear Next Steps
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-600 md:text-xl">
              A calm place for your care journey. Manage appointments, connect with doctors, and stay on top of your health in one clean space.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button className="h-14 rounded-2xl bg-slate-900 px-7 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] hover:bg-slate-800">
                Book Appointment
              </Button>
              <Button variant="outline" className="h-14 rounded-2xl border-slate-300 bg-white px-7 text-slate-900 hover:bg-slate-50">
                View Care Plan
              </Button>
            </div>
          </div>

          <div className="order-1 flex items-center justify-center md:order-2 relative mt-8 md:mt-0">
            {/* Blue-themed animated background glowing blobs */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[600px] max-h-[600px] pointer-events-none">
              <div className="absolute top-0 left-0 w-[26rem] h-[26rem] bg-blue-600 rounded-full filter blur-[120px] opacity-40 animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute top-10 right-0 w-[24rem] h-[24rem] bg-cyan-400 rounded-full filter blur-[120px] opacity-40 animate-[spin_10s_linear_infinite_reverse]" style={{ animationDelay: "2s" }}></div>
              <div className="absolute bottom-0 left-10 w-[28rem] h-[28rem] bg-indigo-500 rounded-full filter blur-[120px] opacity-30 animate-[spin_12s_linear_infinite]" style={{ animationDelay: "4s" }}></div>
              <div className="absolute -bottom-10 right-10 w-[22rem] h-[22rem] bg-sky-400 rounded-full filter blur-[120px] opacity-40 animate-[pulse_6s_ease-in-out_infinite]" style={{ animationDelay: "1s" }}></div>
            </div>

            <div className="group relative w-full max-w-2xl">
              <img
                src={HERO_IMAGE_URL}
                alt="Patient care illustration"
                className="relative z-10 mx-auto h-auto w-full max-w-[520px] translate-y-2 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:-translate-y-1 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="rounded-2xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "120ms" }}
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next Visit</p>
            <p className="text-xl font-semibold">Tomorrow</p>
            <p className="text-sm text-muted-foreground">10:30 AM with Dr. Sarah Jenkins</p>
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "200ms" }}
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Latest Report</p>
            <p className="text-xl font-semibold">Blood Test</p>
            <p className="text-sm text-muted-foreground">Normal range, updated on Oct 12, 2026</p>
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "280ms" }}
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Medications</p>
            <p className="text-xl font-semibold">2 Active</p>
            <p className="text-sm text-muted-foreground">Lisinopril, Atorvastatin</p>
          </CardContent>
        </Card>

        <Card
          className="rounded-2xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "360ms" }}
        >
          <CardContent className="space-y-2 p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Unread Messages</p>
            <p className="text-xl font-semibold">3</p>
            <p className="text-sm text-muted-foreground">From care team and support</p>
          </CardContent>
        </Card>
      </section>

      <section id="care-team" className="scroll-mt-36 grid gap-6 md:grid-cols-2">
        <Card
          className="overflow-hidden rounded-3xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "420ms" }}
        >
          <CardContent className="space-y-3 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">Your Care Team</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Keep in touch with your assigned specialists, review follow-ups, and request support when needed.
            </p>
            <Button variant="outline" className="rounded-full">
              Message Care Team
            </Button>
          </CardContent>
        </Card>

        <Card
          id="wellness"
          className="scroll-mt-36 overflow-hidden rounded-3xl border-border/60 animate-in fade-in slide-in-from-bottom-3 duration-700"
          style={{ animationDelay: "500ms" }}
        >
          <div className="h-52">
            <img
              src={WELLNESS_IMAGE_URL}
              alt="Wellness"
              className="h-full w-full object-cover"
            />
          </div>
          <CardContent className="space-y-3 p-6">
            <h3 className="text-2xl font-semibold tracking-tight">Wellness & Habits</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Track daily goals and small habits that improve your long-term health outcomes.
            </p>
            <Button variant="outline" className="rounded-full">
              Open Wellness
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
