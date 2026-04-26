import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  ArrowUpRight
} from "lucide-react"

export function PatientDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const PATIENT_NAME = user?.email?.split('@')[0] || "Patient"

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back, {PATIENT_NAME}</h1>
          <p className="text-muted-foreground">Here's what's happening with your health journey today.</p>
        </div>
        <Button className="w-fit rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
          <Plus className="mr-2 h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: "Health Score", 
            value: "92/100", 
            sub: "+2 points this week", 
            icon: Heart, 
            color: "text-rose-500", 
            bg: "bg-rose-50" 
          },
          { 
            label: "Next Appointment", 
            value: "Tomorrow", 
            sub: "10:30 AM • Dr. Jenkins", 
            icon: Calendar, 
            color: "text-emerald-500", 
            bg: "bg-emerald-50" 
          },
          { 
            label: "Active Medications", 
            value: "2 Prescribed", 
            sub: "Next dose in 2 hours", 
            icon: Pill, 
            color: "text-blue-500", 
            bg: "bg-blue-50" 
          },
          { 
            label: "New Messages", 
            value: "3 Unread", 
            sub: "From your care team", 
            icon: MessageSquare, 
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
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {[
                { name: "Dr. Sarah Jenkins", specialty: "Cardiologist", time: "Oct 27, 10:30 AM", status: "Confirmed" },
                { name: "Dr. Michael Chen", specialty: "General Practitioner", time: "Nov 02, 02:15 PM", status: "Pending" },
              ].map((appt, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold">
                      {appt.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{appt.name}</p>
                      <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {appt.time}
                    </div>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Trends */}
        <Card className="border-none shadow-md shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Health Trends</CardTitle>
            <CardDescription>Activity overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { label: "Steps", value: "8,432", goal: "10k", progress: 84, color: "bg-emerald-500" },
                { label: "Sleep", value: "7.2h", goal: "8h", progress: 90, color: "bg-blue-500" },
                { label: "Water", value: "1.5L", goal: "2.5L", progress: 60, color: "bg-sky-500" },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-muted-foreground">{item.value} / {item.goal}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              ))}
              
              <div className="rounded-2xl bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Daily Tip</p>
                    <p className="text-xs text-emerald-700">Drink 500ml more water today to reach your goal.</p>
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
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                Start Chat
              </Button>
              <Button variant="outline" className="border-white/20 text-black hover:bg-white hover:text-emerald-600  rounded-xl transition-all duration-300">
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
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Annual Physical Results</p>
                <p className="text-sm text-muted-foreground">Uploaded Oct 15, 2026</p>
              </div>
              <Button variant="outline" className="ml-auto rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
