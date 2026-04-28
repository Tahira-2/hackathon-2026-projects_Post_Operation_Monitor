import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PhysicianDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Dr. Smith</h2>
          <p className="text-muted-foreground">Here is your daily schedule and patient updates.</p>
        </div>
        <Button className="shrink-0">New Consultation</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>You have 6 scheduled appointments today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {[1,2,3].map((i) => (
               <div key={i} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                 <div className="flex-1">
                   <h4 className="font-semibold">Jane Doe</h4>
                   <p className="text-sm text-muted-foreground">Follow-up checkup</p>
                 </div>
                 <div className="text-right">
                   <p className="font-semibold text-sm">10:30 AM</p>
                   <p className="text-xs text-muted-foreground">In 30 mins</p>
                 </div>
                 <Button size="sm" variant="outline">View File</Button>
               </div>
             ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Patient Metrics</CardTitle>
            <CardDescription>Recent test results pending review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm font-medium">
               2 High Priority Reviews
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
               14 Normal Results
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
