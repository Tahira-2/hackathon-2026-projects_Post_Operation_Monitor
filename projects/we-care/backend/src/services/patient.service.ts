import { supabase } from "../lib/supabase";
import { extractLookupName } from "./lookup-service";

export async function getReferralByToken(token: string) {
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("patient_tokens")
    .select("referral_id, expires_at, used")
    .eq("token", token)
    .single();

  if (tokenError || !tokenRecord) throw new Error("Invalid token");
  if (tokenRecord.used) throw new Error("Token has already been used");
  if (new Date(tokenRecord.expires_at) < new Date())
    throw new Error("Token has expired");

  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .select(
      `
      id, diagnosis, urgency, status, clinical_notes, created_at,
      patients (full_name, date_of_birth, gender),
      specialists (
        full_name,
        phone,
        specialties(name),
        hospitals(name)
      )
    `,
    )
    .eq("id", tokenRecord.referral_id)
    .single();

  if (referralError) throw new Error(referralError.message);

  const specialist = Array.isArray(referral.specialists)
    ? referral.specialists[0]
    : referral.specialists;

  return {
    ...referral,
    specialists: specialist
      ? {
          ...specialist,
          specialty: extractLookupName(specialist.specialties) ?? "",
          hospital: extractLookupName(specialist.hospitals) ?? "",
        }
      : specialist,
  };
}

export async function bookAppointment(
  token: string,
  appointmentData: {
    preferred_date: string;
    time_slot: "morning" | "afternoon" | "evening";
    notes?: string;
  },
) {
  const { data: tokenRecord, error: tokenError } = await supabase
    .from("patient_tokens")
    .select("referral_id, expires_at, used")
    .eq("token", token)
    .single();

  if (tokenError || !tokenRecord) throw new Error("Invalid token");
  if (tokenRecord.used) throw new Error("Token has already been used");
  if (new Date(tokenRecord.expires_at) < new Date())
    throw new Error("Token has expired");

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({ referral_id: tokenRecord.referral_id, ...appointmentData })
    .select()
    .single();

  if (appointmentError) throw new Error(appointmentError.message);

  await supabase
    .from("patient_tokens")
    .update({ used: true })
    .eq("token", token);

  return appointment;
}
