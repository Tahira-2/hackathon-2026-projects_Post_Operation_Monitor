import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter, 
  Video, 
  Copy, 
  Check, 
  Loader2,
  CalendarDays
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useGetAppointmentsQuery, useUpdateAppointmentMutation, useCreateAppointmentMutation } from "@/apis/appointmentsApi"
import { useGetDoctorsQuery } from "@/apis/usersApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function Appointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const patientId = user?.patient?.id
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    doctorId: "",
    reason: "",
    startTime: "",
    endTime: "",
    isVirtual: true
  })

  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation()
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { data: appointments, isLoading } = useGetAppointmentsQuery(
    { patientId },
    { skip: !patientId }
  )

  const { data: doctorsData } = useGetDoctorsQuery({})
  const doctors = doctorsData?.data || []

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAppointment.doctorId || !newAppointment.startTime) {
      alert("Please select a doctor and time.")
      return
    }

    try {
      await createAppointment({
        ...newAppointment,
        status: "PENDING",
        patientId: user?.patient?.id,
        endTime: new Date(new Date(newAppointment.startTime).getTime() + 30 * 60000).toISOString()
      }).unwrap()
      setIsDialogOpen(false)
      setNewAppointment({ doctorId: "", reason: "", startTime: "", endTime: "", isVirtual: true })
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to schedule appointment.")
    }
  }

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    
    setCancellingId(id)
    try {
      await updateAppointment({ id, body: { status: "CANCELLED" } }).unwrap()
    } catch (error) {
      alert("Failed to cancel appointment. Please try again.")
    } finally {
      setCancellingId(null)
    }
  }

  const copyLink = (appointmentId: string) => {
    const url = `${window.location.origin}/patient/consultation/${appointmentId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(appointmentId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 border-rose-200"
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "RESCHEDULED":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-muted-foreground font-medium animate-pulse">Loading your appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Appointments</h1>
          <p className="text-muted-foreground">Manage and track your upcoming healthcare visits.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button 
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            onClick={() => setIsDialogOpen(true)}
          >
            Schedule New
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>
              Book a new consultation with one of our specialists.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Specialist</Label>
              <Select 
                id="doctor"
                className="rounded-xl"
                placeholder="Choose a consultant"
                value={newAppointment.doctorId}
                onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}
                options={doctors.map((doc: any) => ({
                  label: doc.fullName || doc.email,
                  value: doc.doctor?.id || doc.id
                }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Date & Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  className="rounded-xl"
                  value={newAppointment.startTime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <textarea
                id="reason"
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Briefly describe your symptoms..."
                value={newAppointment.reason}
                onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Virtual Consultation</p>
              </div>
              <input 
                type="checkbox" 
                checked={newAppointment.isVirtual}
                onChange={(e) => setNewAppointment({ ...newAppointment, isVirtual: e.target.checked })}
                className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-semibold mt-2"
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Appointment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {!appointments || appointments.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No appointments yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1 mb-6">
              You don't have any scheduled appointments. Book your first consultation with a specialist.
            </p>
            <Button 
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setIsDialogOpen(true)}
            >
              Find a Consultant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt: any) => (
            <Card key={appt.id} className="border-none shadow-md shadow-slate-200/50 hover:shadow-lg transition-all overflow-hidden group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 md:w-64 bg-slate-50 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center mb-2">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {format(new Date(appt.startTime), "MMM")}
                      </span>
                      <span className="text-xl font-bold text-slate-900 leading-none">
                        {format(new Date(appt.startTime), "dd")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <Clock className="h-4 w-4 text-slate-400" /> {format(new Date(appt.startTime), "p")}
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusStyle(appt.status)
                        )}>
                          {appt.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                          {appt.isVirtual ? "Video Call" : "In-Person"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{appt.doctor?.user?.fullName || "Doctor"}</h3>
                      <p className="text-emerald-600 font-medium text-sm">{appt.doctor?.specialization?.name || "Specialist"}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <MapPin className="h-4 w-4" /> {appt.isVirtual ? "Online Consultation" : (appt.location || "Hospital Clinic")}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 shrink-0 items-center">
                      {appt.status === "CONFIRMED" && appt.callSession?.id && (
                        <div className="flex flex-col items-end gap-1.5 mr-2">
                          <Button
                            size="sm"
                            className="bg-purple-600 text-white hover:bg-purple-700 rounded-xl gap-2 shadow-md shadow-purple-200"
                            onClick={() => navigate(`/patient/consultation/${appt.id}`)}
                          >
                            <Video className="w-4 h-4" />
                            Join Call
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] text-muted-foreground hover:text-emerald-600 gap-1 px-2 font-bold uppercase tracking-tight"
                            onClick={() => copyLink(appt.id)}
                          >
                            {copiedId === appt.id ? (
                              <><Check className="w-3 h-3 text-emerald-600" /> Copied!</>
                            ) : (
                              <><Copy className="w-3 h-3" /> Copy link</>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50">
                          Reschedule
                        </Button>
                        {appt.status !== "CANCELLED" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                            onClick={() => handleCancel(appt.id)}
                            disabled={cancellingId === appt.id}
                          >
                            {cancellingId === appt.id ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            Cancel
                          </Button>
                        )}
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-xl text-slate-300 group-hover:text-emerald-600 transition-colors ml-2"
                        onClick={() => navigate("/patient/consultants")}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
