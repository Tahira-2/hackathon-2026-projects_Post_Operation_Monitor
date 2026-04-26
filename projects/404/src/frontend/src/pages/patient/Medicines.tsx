import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Clock, Plus, AlertCircle, Calendar } from "lucide-react"

export function Medicines() {
  const prescriptions = [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      reason: "Blood Pressure",
      nextRefill: "Nov 12, 2026",
      reminders: ["08:00 AM"],
      status: "Active"
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily, before bed",
      reason: "Cholesterol",
      nextRefill: "Dec 01, 2026",
      reminders: ["09:30 PM"],
      status: "Active"
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Medications</h1>
          <p className="text-muted-foreground">Keep track of your prescriptions and set reminders.</p>
        </div>
        <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prescriptions.map((pill, i) => (
          <Card key={i} className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all overflow-hidden relative">
            <div className="absolute right-0 top-0 p-4">
               <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                 {pill.status}
               </span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Pill className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{pill.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{pill.dosage} • {pill.reason}</p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Frequency</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {pill.frequency}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Next Refill</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {pill.nextRefill}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {pill.reminders.map((time, j) => (
                    <span key={j} className="text-[11px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
                      🔔 {time}
                    </span>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  Edit Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md shadow-slate-200/50 bg-amber-50/50 border-amber-100">
        <CardContent className="p-6 flex gap-4 items-start text-amber-900">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="space-y-1">
            <p className="font-bold">Medical Safety Reminder</p>
            <p className="text-sm opacity-90 leading-relaxed">
              Always follow the exact dosage instructions provided by your doctor. If you experience unexpected side effects, contact your care team immediately or visit the nearest emergency center.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
