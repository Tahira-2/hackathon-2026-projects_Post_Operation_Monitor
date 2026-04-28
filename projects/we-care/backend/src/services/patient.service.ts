import { supabase } from "../lib/supabase";
import { extractLookupName } from "./lookup-service";

interface DoctorDirectoryRow {
  id: string;
  full_name: string;
  contact_number: string | null;
  specialties: { name: string } | Array<{ name: string }> | null;
  hospitals: { name: string } | Array<{ name: string }> | null;
}

async function getDoctorById(doctorId: string) {
  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, contact_number, specialties(name), hospitals(name)")
    .eq("id", doctorId)
    .single();

  if (error) throw new Error(error.message);

  const doctor = data as DoctorDirectoryRow;
  return {
    id: doctor.id,
    full_name: doctor.full_name,
    phone: doctor.contact_number,
    specialty: extractLookupName(doctor.specialties) ?? "",
    hospital: extractLookupName(doctor.hospitals) ?? "",
  };
}

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
      id, doctor_id, diagnosis, urgency, status, clinical_notes, created_at,
      patients (full_name, date_of_birth, gender),
      specialist:doctors!referrals_referred_by_fkey (
        full_name,
        contact_number,
        specialties(name),
        hospitals(name)
      )
    `,
    )
    .eq("id", tokenRecord.referral_id)
    .single();

  if (referralError) throw new Error(referralError.message);
  const targetDoctor = await getDoctorById(referral.doctor_id);

  return {
    ...referral,
    targetDoctor,
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
