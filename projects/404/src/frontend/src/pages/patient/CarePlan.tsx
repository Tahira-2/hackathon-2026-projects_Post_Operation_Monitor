import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, Clock, ClipboardList, CheckCircle2, Loader2, Info } from "lucide-react"
import { useGetCarePlansQuery } from "@/apis/usersApi"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"

export function CarePlan() {
  const { user } = useAuth()
  const patientId = user?.patient?.id
  
  const { data: carePlans, isLoading } = useGetCarePlansQuery(patientId || "", {
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Care Plan & Follow-ups</h1>
          <p className="text-muted-foreground">Your personalized recovery instructions and upcoming care steps.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {!carePlans || carePlans.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No active care plans</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Your care plans and follow-up instructions will appear here after your consultations.
              </p>
            </CardContent>
          </Card>
        ) : (
          carePlans.map((plan: any, i: number) => (
            <Card key={plan.id} className="border-none shadow-md shadow-slate-200/50 overflow-hidden group hover:shadow-lg transition-all">
              <CardHeader className="bg-slate-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Generated on {format(new Date(plan.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  {plan.followUpDate && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-bold">{format(new Date(plan.followUpDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 p-4 opacity-5">
                    <ClipboardList className="h-24 w-24" />
                  </div>
                  <h4 className="text-emerald-900 font-bold mb-3 flex items-center gap-2 uppercase text-xs tracking-wider">
                    <Info className="h-4 w-4" />
                    Medical Instructions
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {plan.instructions}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                     <Clock className="h-4 w-4" />
                     Last updated {format(new Date(plan.createdAt), "p")}
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
