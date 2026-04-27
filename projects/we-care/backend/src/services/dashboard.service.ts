import { supabase } from "../lib/supabase";
import type { ReferralViewType } from "./referral-view";

type ReferralStatus = "pending" | "sent" | "accepted" | "completed";
type ReferralUrgency = "low" | "medium" | "high";

interface ReferralRow {
  id: string;
  diagnosis: string | null;
  required_specialty: string | null;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  created_at: string;
  updated_at: string;
  doctor_id: string;
  patients: { full_name: string } | Array<{ full_name: string }> | null;
}


function toReferralStatus(status: ReferralStatus) {
  return status.toUpperCase();
}

function toReferralUrgency(urgency: ReferralUrgency) {
  if (urgency === "high") return "HIGH";
  if (urgency === "medium") return "ELEVATED";
  return "ROUTINE";
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

export async function getDashboardSummary(doctorId: string, type: ReferralViewType) {
  let query = supabase
    .from("referrals")
    .select(
      `
      id, diagnosis, required_specialty, urgency, status, created_at, updated_at, doctor_id,
      patients (full_name)
    `,
    )
    .order("created_at", { ascending: false });

  if (type === "outbound") {
    query = query.eq("doctor_id", doctorId);
  } else {
    query = query.eq("doctor_id", doctorId);

    if (type === "pending") {
      query = query.eq("status", "pending");
    }
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const referrals = (data ?? []) as ReferralRow[];
  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter((referral) => referral.status === "pending").length;
  const completedReferrals = referrals.filter((referral) => referral.status === "completed").length;
  const acceptedReferrals = referrals.filter((referral) => referral.status === "accepted").length;
  const highPriorityPending = referrals.filter(
    (referral) => referral.status === "pending" && referral.urgency === "high",
  ).length;

  const recentMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: getMonthLabel(date),
      referrals: 0,
    };
  });

  const monthIndex = new Map(recentMonths.map((month) => [month.key, month]));
  const specialtyCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>([
    ["Pending", 0],
    ["Sent", 0],
    ["Accepted", 0],
    ["Completed", 0],
  ]);

  for (const referral of referrals) {
    const createdAt = new Date(referral.created_at);
    const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const monthBucket = monthIndex.get(monthKey);
    if (monthBucket) monthBucket.referrals += 1;

    const specialty = referral.required_specialty ?? "General";
    specialtyCounts.set(specialty, (specialtyCounts.get(specialty) ?? 0) + 1);

    const statusLabel = referral.status.charAt(0).toUpperCase() + referral.status.slice(1);
    statusCounts.set(statusLabel, (statusCounts.get(statusLabel) ?? 0) + 1);
  }

  const bySpecialty = Array.from(specialtyCounts.entries())
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);

  const statusDistribution = Array.from(statusCounts.entries()).map(([name, value]) => ({
    name,
    value,
    color:
      name === "Completed"
        ? "#22c55e"
        : name === "Accepted"
          ? "#3b82f6"
          : name === "Pending"
            ? "#f97316"
            : "#94a3b8",
  }));

  const recentReferrals = referrals.slice(0, 5).map((referral) => {
    const patient = Array.isArray(referral.patients) ? referral.patients[0] : referral.patients;
    return {
      id: referral.id,
      patient: patient?.full_name ?? "Unknown Patient",
      diagnosis: referral.diagnosis ?? "Unspecified diagnosis",
      specialty: referral.required_specialty ?? "General",
      specialist: "Unassigned",
      urgency: toReferralUrgency(referral.urgency),
      status: toReferralStatus(referral.status),
      date: new Date(referral.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });

  const topSpecialty = bySpecialty[0]?.specialty ?? "General Medicine";
  const aiInsight =
    highPriorityPending > 0
      ? `${highPriorityPending} high-priority referrals need attention today. Start with ${topSpecialty} to reduce delay risk.`
      : `${topSpecialty} is your busiest specialty right now. Completed referrals are trending ahead of pending volume.`;

  return {
    kpis: {
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      acceptedReferrals,
    },
    monthlyTrend: recentMonths,
    bySpecialty,
    statusDistribution,
    recentReferrals,
    aiInsight,
  };
}
