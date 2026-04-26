import { ShieldCheck, Activity, Users, Database } from "lucide-react"

export function Services() {
  return (
    <div className="flex-1 w-full bg-background py-20">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Our Healthcare Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">We provide a unified infrastructure for clinical documentation, patient communication, and operational efficiency.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 pb-10 bg-muted/20 border rounded-2xl space-y-4 transition-shadow">
            <Activity className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold">Patient Electronic Records</h3>
            <p className="text-muted-foreground leading-relaxed">Secure, HIPAA-compliant access to complete digital health files instantly synced across care providers, giving patients sovereignty over their data.</p>
          </div>
          <div className="p-8 pb-10 bg-muted/20 border rounded-2xl space-y-4 transition-shadow">
            <Users className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold">Telemedicine & Appointments</h3>
            <p className="text-muted-foreground leading-relaxed">Schedule, manage, and execute remote telemedicine consults or in-person visits with automated calendar bindings and smart reminders.</p>
          </div>
          <div className="p-8 pb-10 bg-muted/20 border rounded-2xl space-y-4 transition-shadow">
            <Database className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold">Decentralized Storage</h3>
            <p className="text-muted-foreground leading-relaxed">Future-proofing medical records by migrating them off legacy systems onto highly redundant, encrypted storage nodes for lifetime permanence.</p>
          </div>
          <div className="p-8 pb-10 bg-muted/20 border rounded-2xl space-y-4 transition-shadow">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h3 className="text-2xl font-semibold">Identity Access Management</h3>
            <p className="text-muted-foreground leading-relaxed">Strict role-based access defining precisely what an Admin, Physician, or Patient can observe and manipulate, guaranteeing privacy compliance.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
