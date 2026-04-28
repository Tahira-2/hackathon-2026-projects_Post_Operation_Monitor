import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-6 text-foreground">
        Welcome to <span className="text-primary pr-2">HealthCore</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-[650px] mb-10 leading-relaxed">
        Your complete medical management platform. Securely bridging the gap between patients, healthcare providers, and administrators.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild size="lg" className="h-12 px-8 text-base"><Link to="/patient/signup">For Patients: Get Started</Link></Button>
        <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base"><Link to="/login">Login to Portal</Link></Button>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full text-left">
         <div className="p-6 bg-card rounded-xl border transition-all">
           <h3 className="font-semibold text-lg mb-2 text-primary">Patient Portal</h3>
           <p className="text-muted-foreground text-sm mb-4">Access records, book appointments, and monitor your health journey.</p>
           <Link to="/patient/login" className="text-sm font-medium text-primary hover:underline">Patient Login &rarr;</Link>
         </div>
         <div className="p-6 bg-card rounded-xl border transition-all">
           <h3 className="font-semibold text-lg mb-2 text-secondary-foreground">Physician Portal</h3>
           <p className="text-muted-foreground text-sm mb-4">Manage schedules, patient data securely, and stream-line workflows.</p>
           <Link to="/physician/login" className="text-sm font-medium text-primary hover:underline">Physician Login &rarr;</Link>
         </div>
         <div className="p-6 bg-card rounded-xl border transition-all">
           <h3 className="font-semibold text-lg mb-2 text-destructive">Admin Portal</h3>
           <p className="text-muted-foreground text-sm mb-4">Oversee hospital operations, manage users, and view analytics.</p>
           <Link to="/admin/login" className="text-sm font-medium text-primary hover:underline">Admin Login &rarr;</Link>
         </div>
      </div>
    </div>
  )
}
