import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Search, Star, MapPin, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Consultants() {
  const navigate = useNavigate()
  const consultants = [
    {
      name: "Dr. Sarah Jenkins",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 124,
      experience: "12 years",
      location: "Central Medical Plaza",
      nextAvailable: "Tomorrow, 10:30 AM"
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Dermatologist",
      rating: 4.8,
      reviews: 89,
      experience: "8 years",
      location: "Eastside Health Hub",
      nextAvailable: "Oct 29, 02:00 PM"
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrician",
      rating: 5.0,
      reviews: 210,
      experience: "15 years",
      location: "West Wellness Center",
      nextAvailable: "Oct 31, 09:15 AM"
    }
  ]

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Find Consultants</h1>
          <p className="text-muted-foreground">Book appointments with top-rated medical specialists.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search specialty or doctor..." className="pl-10 rounded-xl bg-white border-slate-200" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {consultants.map((doc, i) => (
          <Card key={i} className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all overflow-hidden group">
            <div className="h-32 bg-emerald-600 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"></div>
               <div className="absolute -bottom-6 left-6 h-20 w-20 rounded-2xl bg-white p-1 shadow-md">
                 <div className="h-full w-full rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                   {doc.name.split(' ')[1][0]}
                 </div>
               </div>
            </div>
            <CardContent className="pt-16 p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
                  <p className="text-sm font-medium text-emerald-600">{doc.specialty}</p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {doc.rating}
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {doc.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> {doc.experience} Experience
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xs">
                    <p className="text-muted-foreground mb-0.5">Next Available</p>
                    <p className="font-bold text-slate-900">{doc.nextAvailable}</p>
                  </div>
                </div>
                <Button 
                  className="w-full rounded-xl bg-slate-900 hover:bg-slate-800"
                  onClick={() => navigate("/patient/appointments")}
                >
                  Book Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
