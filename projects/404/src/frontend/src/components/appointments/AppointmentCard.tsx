import {
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Video,
  XCircle,
} from "lucide-react";
import type {
  Appointment,
  AppointmentStatus,
} from "../../types/appointment.types";
import { Card, CardContent } from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface AppointmentCardProps {
  appointment: Appointment;
  isPhysicianView?: boolean;
  onJoinCall?: () => void;
  onCancel?: () => void;
}

const statusColors: Record<
  AppointmentStatus,
  "blue" | "green" | "gray" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "blue",
  CANCELLED: "gray",
  COMPLETED: "green",
  RESCHEDULED: "outline",
};

const formatTime = (isoString: string) => {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export default function AppointmentCard({
  appointment,
  isPhysicianView = false,
  onJoinCall,
  onCancel,
}: AppointmentCardProps) {
  const isPast = new Date(appointment.endTime) < new Date();
  const isActive = appointment.status === "CONFIRMED" && !isPast;

  return (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[appointment.status]}>
                  {appointment.status}
                </Badge>
                {isPast && appointment.status !== "CANCELLED" && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                    Past
                  </span>
                )}
              </div>
              <h3 className="mt-2 text-base font-semibold text-gray-900">
                {appointment.reason || "General Consultation"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isPhysicianView ? "Patient ID" : "Provider ID"}{" "}
                {
                  (isPhysicianView
                    ? appointment.patientId
                    : appointment.doctorId
                  ).split("-")[0]
                }
                ...
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-3 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Date
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {formatDate(appointment.startTime)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {formatTime(appointment.startTime)} -{" "}
              {formatTime(appointment.endTime)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={14} />
            Created {new Date(appointment.createdAt).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            {isActive && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="border-gray-200 text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <XCircle size={16} /> Cancel
              </Button>
            )}

            {isActive && onJoinCall && (
              <Button size="sm" onClick={onJoinCall}>
                <Video size={16} /> Join Call
              </Button>
            )}

            {appointment.status === "COMPLETED" && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 size={16} /> Completed
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
