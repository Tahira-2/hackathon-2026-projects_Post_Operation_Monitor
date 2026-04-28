import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Clock, Plus, AlertCircle, Calendar, Loader2 } from "lucide-react"
import { useGetMedicationsQuery } from "@/apis/usersApi"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"

export function Medicines() {
  const { user } = useAuth()
  const patientId = user?.patient?.id
  
  const { data: medications, isLoading } = useGetMedicationsQuery(patientId || "", {
    skip: !patientId
  })

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Medications</h1>
          <p className="text-muted-foreground">Keep track of your active prescriptions from recent consultations.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {!medications || medications.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
            No active medications found.
          </div>
        ) : (
          medications.map((pill: any, i: number) => (
            <Card key={i} className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all overflow-hidden relative">
              <div className="absolute right-0 top-0 p-4">
                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                   pill.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                 }`}>
                   {pill.isActive ? "Active" : "Completed"}
                 </span>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Pill className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">{pill.name}</h3>
                    <p className="text-sm font-medium text-slate-500">{pill.dosage || "As prescribed"} • {pill.frequency || "Check instructions"}</p>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-1 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Doctor's Notes</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {pill.notes || "No additional notes provided."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5" /> Started {format(new Date(pill.startDate), "MMM d, yyyy")}
                  </div>
                  <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    Set Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
