import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../ui/Card";

interface CareProgressCardProps {
  completedTasks: number;
  totalTasks: number;
  title?: string;
}

export default function CareProgressCard({
  completedTasks,
  totalTasks,
  title = "Today's Care Plan",
}: CareProgressCardProps) {
  const percentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isComplete = percentage === 100;

  return (
    <Card className="relative overflow-hidden border border-[var(--color-border)] bg-white">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {title}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {completedTasks} of {totalTasks} tasks complete
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500">
            <span>Progress</span>
            <span>{percentage}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-700"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {isComplete && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            <TrendingUp size={16} /> Great job staying on track today.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
