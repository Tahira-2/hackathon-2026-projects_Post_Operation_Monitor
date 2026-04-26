import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useGetAppointmentsQuery, 
  useUpdateAppointmentMutation,
  useCreateAppointmentMutation
} from "@/apis/appointmentsApi";
import { useGetUsersQuery } from "@/apis/usersApi";
import { 
  useGetWorkingHoursQuery, 
  useGetBusyBlocksQuery 
} from "@/apis/availabilityApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Clock, Plus, Calendar, MessageSquare, Phone, Video } from "lucide-react";
import { format, parseISO, isWithinInterval, areIntervalsOverlapping } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const doctorId = user?.doctor?.id;

  const { data: appointments, isLoading, refetch } = useGetAppointmentsQuery(
    { doctorId },
    { skip: !doctorId }
  );

  const { data: patientsData } = useGetUsersQuery({ 
    role: "PATIENT",
    pageSize: 100 
  });

  const { data: workingHours } = useGetWorkingHoursQuery({ doctorId }, { skip: !doctorId });
  const { data: busyBlocks } = useGetBusyBlocksQuery({ doctorId }, { skip: !doctorId });

  const [updateAppointment] = useUpdateAppointmentMutation();
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const patients = patientsData?.data || [];

  const handleReschedule = (apt: any) => {
    setEditingAppointmentId(apt.id);
    setPatientId(apt.patientId);
    setStartTime(apt.startTime.split('.')[0]); // Remove milliseconds/Z for local datetime-local input
    setEndTime(apt.endTime.split('.')[0]);
    setReason(apt.reason || "");
    setIsSheetOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAppointment({ id, body: { status: newStatus } }).unwrap();
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      refetch();
    } catch (e) {
      toast.error(`Failed to update appointment status`);
    }
  };

  const handleSave = async () => {
    if (!doctorId) {
      toast.error("Physician profile not found");
      return;
    }

    if (!patientId || !startTime || !endTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Validation logic
      const start = parseISO(startTime);
      const end = parseISO(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        toast.error("Invalid date or time selected");
        return;
      }

      if (start >= end) {
        toast.error("Start time must be before end time");
        return;
      }

      const dayName = format(start, "EEEE").toUpperCase();

      // 1. Check Working Hours
      const dayHours = workingHours?.find((wh: any) => wh.day === dayName);
      if (!dayHours) {
        toast.error(`You have not set working hours for ${dayName}`);
        return;
      }

      const [whStartH, whStartM] = dayHours.startTime.split(":").map(Number);
      const [whEndH, whEndM] = dayHours.endTime.split(":").map(Number);
      
      const whStart = new Date(start);
      whStart.setHours(whStartH, whStartM, 0, 0);
      const whEnd = new Date(start);
      whEnd.setHours(whEndH, whEndM, 0, 0);

      if (!isWithinInterval(start, { start: whStart, end: whEnd }) || 
          !isWithinInterval(end, { start: whStart, end: whEnd })) {
        toast.error(`Appointment must be within working hours (${dayHours.startTime} - ${dayHours.endTime})`);
        return;
      }

      // 2. Check Busy Blocks
      const overlapsBusyBlock = busyBlocks?.some((block: any) => {
        const bStart = parseISO(block.startTime);
        const bEnd = parseISO(block.endTime);
        return areIntervalsOverlapping(
          { start, end },
          { start: bStart, end: bEnd }
        );
      });

      if (overlapsBusyBlock) {
        toast.error("This time overlaps with an existing busy block");
        return;
      }

      if (editingAppointmentId) {
        await updateAppointment({
          id: editingAppointmentId,
          body: {
            startTime,
            endTime,
            reason,
            status: "RESCHEDULED"
          }
        }).unwrap();
        toast.success("Appointment rescheduled successfully");
      } else {
        await createAppointment({
          doctorId,
          patientId,
          startTime,
          endTime,
          reason,
          status: "PENDING"
        }).unwrap();
        toast.success("Appointment scheduled successfully");
      }
      setIsSheetOpen(false);
      resetForm();
      refetch();
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to schedule appointment");
    }
  };

  const resetForm = () => {
    setPatientId("");
    setStartTime("");
    setEndTime("");
    setReason("");
    setEditingAppointmentId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 bg-yellow-50">{status}</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">{status}</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Button onClick={() => { resetForm(); setIsSheetOpen(true); }} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Appointment
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                  No appointments scheduled.
                </TableCell>
              </TableRow>
            ) : (
              appointments?.map((apt: any) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">
                    {apt.patient?.user?.fullName || "Unknown Patient"}
                    <div className="text-xs text-muted-foreground">{apt.patient?.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                         <Clock className="w-3.5 h-3.5 text-primary" />
                         <span className="text-sm font-medium">
                           {format(new Date(apt.startTime), "PPp")}
                         </span>
                       </div>
                       <div className="flex items-center gap-2 pl-5">
                         <span className="text-[10px] text-muted-foreground uppercase font-bold">to</span>
                         <span className="text-xs text-muted-foreground">
                           {format(new Date(apt.endTime), "p")}
                         </span>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell>{apt.reason || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       {/* Show both buttons for PENDING, only Cancel for CONFIRMED */}
                       {apt.status === "PENDING" && (
                         <>
                           <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                              onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                              onClick={() => handleUpdateStatus(apt.id, "CANCELLED")}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                         </>
                       )}
                       {(apt.status === "CONFIRMED" || apt.status === "RESCHEDULED") && (
                         <div className="flex gap-1">
                           <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 px-2"
                              onClick={() => handleReschedule(apt)}
                              title="Reschedule"
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/20 px-2"
                              onClick={() => navigate(`/physician/chat?patientId=${apt.patientId}&name=${apt.patient?.user?.fullName}`)}
                              title="Chat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200 px-2"
                              onClick={() => navigate(`/physician/chat?patientId=${apt.patientId}&action=audio`)}
                              title="Audio Call"
                            >
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200 px-2"
                              onClick={() => navigate(`/physician/chat?patientId=${apt.patientId}&action=video`)}
                              title="Video Call"
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                         </div>
                       )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[450px]">
          <SheetHeader>
            <SheetTitle>{editingAppointmentId ? "Reschedule Appointment" : "Add Appointment"}</SheetTitle>
            <SheetDescription>
              {editingAppointmentId 
                ? "Update the date and time for this appointment."
                : "Fill in the details to schedule a manual appointment with a patient."}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select Patient <span className="text-destructive">*</span></Label>
              <Select 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={!!editingAppointmentId}
                options={[
                  { label: "Select a patient", value: "" },
                  ...patients.filter((u: any) => u.patient?.id).map((u: any) => ({
                    label: `${u.fullName} (${u.email})`,
                    value: u.patient.id
                  }))
                ]}
              />
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>Start Time <span className="text-destructive">*</span></Label>
                <Input 
                   type="datetime-local" 
                   value={startTime}
                   onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time <span className="text-destructive">*</span></Label>
                <Input 
                   type="datetime-local" 
                   value={endTime}
                   onChange={e => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Reason for Visit</Label>
              <Input 
                 placeholder="eg. Monthly checkup, Report review..." 
                 value={reason}
                 onChange={e => setReason(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="mt-6 flex-col gap-2">
             <Button 
               className="w-full" 
               onClick={handleSave} 
               disabled={isCreating}
             >
               {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (editingAppointmentId ? <Calendar className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
               {editingAppointmentId ? "Reschedule Appointment" : "Schedule Appointment"}
             </Button>
             <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(false)}>
               Cancel
             </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
