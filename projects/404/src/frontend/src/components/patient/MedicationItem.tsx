import { AlertCircle, Clock, Pill } from "lucide-react";
import { Card } from "../ui/Card";

interface MedicationItemProps {
  name: string;
  dosage: string;
  timing: string;
  instructions?: string;
  status: "due" | "taken" | "skipped";
}

export default function MedicationItem({
  name,
  dosage,
  timing,
  instructions,
  status,
}: MedicationItemProps) {
  const isDue = status === "due";
  const isTaken = status === "taken";

  return (
    <Card
      className={`border ${
        isDue
          ? "border-blue-200 bg-white"
          : isTaken
            ? "border-emerald-100 bg-emerald-50/50"
            : "border-gray-200 bg-gray-50/70"
      } p-4`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            isDue
              ? "bg-blue-50 text-blue-600"
              : isTaken
                ? "bg-emerald-100 text-emerald-600"
                : "bg-gray-200 text-gray-500"
          }`}
        >
          <Pill size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4
                className={`text-base font-semibold ${isTaken ? "text-gray-700" : "text-gray-900"}`}
              >
                {name}
              </h4>
              <p className="text-sm text-gray-500">{dosage}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                isDue
                  ? "border-blue-100 bg-blue-50 text-blue-700"
                  : isTaken
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-100 text-gray-600"
              }`}
            >
              <Clock size={12} /> {timing}
            </span>
          </div>

          {instructions && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-gray-100 bg-white/70 p-3 text-xs text-gray-600">
              <AlertCircle size={14} className="mt-0.5 text-gray-400" />
              <p>{instructions}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
