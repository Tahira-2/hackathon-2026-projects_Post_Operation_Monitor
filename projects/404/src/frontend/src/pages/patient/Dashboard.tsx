import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { 
  Calendar, 
  Activity, 
  Pill, 
  MessageSquare, 
  ChevronRight, 
  Heart, 
  Clock, 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Loader2
} from "lucide-react"
import { useGetAppointmentsQuery } from "@/apis/appointmentsApi"
import { useGetHistoryQuery } from "@/apis/transcriptApi"
import { format } from "date-fns"

export function PatientDashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const patientId = user?.patient?.id
  const PATIENT_NAME = user?.fullName || user?.email?.split('@')[0] || "Patient"

  const { data: appointments, isLoading: isLoadingApts } = useGetAppointmentsQuery(
    { patientId },
    { skip: !patientId }
  )

  const { data: history, isLoading: isLoadingHistory } = useGetHistoryQuery(
    patientId || "",
    { skip: !patientId }
  )

  const upcomingApts = appointments?.filter((a: any) => 
    a.status === 'CONFIRMED' || a.status === 'PENDING'
  ).slice(0, 3) || []

  const latestSummary = history?.[0]
  const activeMedications = latestSummary?.medications || []

  if (isLoadingApts || isLoadingHistory) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {PATIENT_NAME}</h1>
          <p className="text-muted-foreground">Here's what's happening with your health journey today.</p>
        </div>
        <Button 
          className="w-fit rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
          onClick={() => navigate("/patient/appointments")}
        >
          <Plus className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: "Next Appointment", 
            value: upcomingApts[0] ? format(new Date(upcomingApts[0].startTime), "MMM d") : "None", 
            sub: upcomingApts[0] ? `${format(new Date(upcomingApts[0].startTime), "p")} • Dr. ${upcomingApts[0].doctor?.user?.fullName.split(' ').pop()}` : "Schedule one today", 
            icon: Calendar, 
            color: "text-emerald-500", 
            bg: "bg-emerald-50" 
          },
          { 
            label: "Active Medications", 
            value: activeMedications.length > 0 ? `${activeMedications.length} Prescribed` : "None", 
            sub: activeMedications.length > 0 ? "From your last visit" : "No active prescriptions", 
            icon: Pill, 
            color: "text-blue-500", 
            bg: "bg-blue-50" 
          },
          { 
            label: "Medical Reports", 
            value: history?.length || 0, 
            sub: "AI-generated summaries", 
            icon: Activity, 
            color: "text-rose-500", 
            bg: "bg-rose-50" 
          },
          { 
            label: "Care Team", 
            value: new Set(history?.map((h: any) => h.callSession.appointment.doctorId)).size || 0, 
            sub: "Specialists contacted", 
            icon: Heart, 
            color: "text-amber-500", 
            bg: "bg-amber-50" 
          },
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-md shadow-slate-200/50 transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 border-none shadow-md shadow-slate-200/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled visits for the next 30 days.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              onClick={() => navigate("/patient/appointments")}
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {upcomingApts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground italic">
                  No upcoming appointments found.
                </div>
              ) : (
                upcomingApts.map((appt: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold">
                        {appt.doctor?.user?.fullName?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Dr. {appt.doctor?.user?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{appt.reason || "General Consultation"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> {format(new Date(appt.startTime), "MMM d, p")}
                      </div>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Trends */}
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Latest Prescriptions</CardTitle>
            <CardDescription>From your last consultation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activeMedications.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground italic text-sm">
                  No active prescriptions found.
                </div>
              ) : (
                activeMedications.map((med: string, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Pill className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{med}</p>
                      <p className="text-xs text-muted-foreground">Prescribed on {format(new Date(latestSummary.createdAt), "MMM d")}</p>
                    </div>
                  </div>
                ))
              )}
              
              <div className="rounded-2xl bg-emerald-50 p-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Wellness Tip</p>
                    <p className="text-xs text-emerald-700">Stay hydrated and follow your care plan.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Team */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-md shadow-slate-200/50 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/5 blur-3xl"></div>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Need Help?</CardTitle>
            <CardDescription className="text-slate-400">Connect with your care team instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-300">
              Our medical specialists are available for consultations. Start a chat or schedule a video call for immediate assistance.
            </p>
            <div className="flex gap-3 pt-2">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                onClick={() => navigate("/patient/chat")}
              >
                Start Chat
              </Button>
              <Button 
                variant="outline" 
                className="border-white/20 text-black hover:bg-white hover:text-emerald-600 rounded-xl transition-all duration-300"
              >
                Call Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md shadow-slate-200/50 overflow-hidden">
          <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
            <h3 className="font-bold">Latest Report</h3>
            <ArrowUpRight className="h-5 w-5 opacity-80" />
          </div>
          <CardContent className="p-6">
            {latestSummary ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Consultation Summary</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(latestSummary.createdAt), "PPP")}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="ml-auto rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => navigate(`/patient/appointments`)} // Or to a dedicated summary page if it exists
                >
                  View
                </Button>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground italic">
                No recent reports available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
