import { useAuth } from "@/hooks/useAuth";
import { 
  useGetAppointmentsQuery, 
  useUpdateAppointmentMutation 
} from "@/apis/appointmentsApi";
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
import { Loader2, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function Appointments() {
  const { user } = useAuth();
  const { data: appointments, isLoading, refetch } = useGetAppointmentsQuery(
    { doctorId: user?.doctor?.id },
    { skip: !user?.doctor?.id }
  );

  const [updateAppointment] = useUpdateAppointmentMutation();

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateAppointment({ id, body: { status: newStatus } }).unwrap();
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      refetch();
    } catch (e) {
      toast.error(`Failed to update appointment status`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="text-yellow-600 bg-yellow-50">{status}</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;
      case "CANCELED":
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
                <TableCell colSpan={5} className="h-24 text-center">
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
                    <div className="flex items-center gap-2">
                       <Clock className="w-4 h-4 text-muted-foreground" />
                       <span className="text-sm">
                         {format(new Date(apt.startTime), "PPp")} - {format(new Date(apt.endTime), "p")}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>{apt.reason || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(apt.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {apt.status === "PENDING" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            onClick={() => handleUpdateStatus(apt.id, "CANCELED")}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {apt.status === "CONFIRMED" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                          onClick={() => handleUpdateStatus(apt.id, "CANCELED")}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
