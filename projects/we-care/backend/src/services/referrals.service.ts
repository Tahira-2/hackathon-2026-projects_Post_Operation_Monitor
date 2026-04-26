import { supabase } from "../lib/supabase";
import { randomUUID } from 'crypto';
import { sendPatientPortalEmail } from './email.service';
import { extractLookupName } from "./lookup-service";

interface ReferralsQueryOptions {
  page: number;
  pageSize: number;
}

export async function createPatientAndReferral(
  doctorId: string,
  patientData: {
    full_name: string;
    date_of_birth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    medical_history?: string;
  },
  referralData: {
    specialist_id?: string;
    clinical_notes: string;
    extracted_data?: object;
    diagnosis?: string;
    required_specialty?: string;
    urgency: "low" | "medium" | "high";
  },
) {
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .insert(patientData)
    .select()
    .single();

  if (patientError) throw new Error(patientError.message);

  const { data: referral, error: referralError } = await supabase
    .from("referrals")
    .insert({ doctor_id: doctorId, patient_id: patient.id, ...referralData })
    .select()
    .single();

  if (referralError) throw new Error(referralError.message);

  return { patient, referral };
}

export async function getReferralsByDoctor(
  doctorId: string,
  { page, pageSize }: ReferralsQueryOptions,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("referrals")
    .select(
      `
      id, clinical_notes, diagnosis, urgency, status, created_at, required_specialty,
      patients (id, full_name),
      specialist:doctors!referrals_specialist_id_fkey (
        id,
        full_name,
        contact_number,
        specialties(name),
        hospitals(name)
      )
    `,
      { count: "exact" },
    )
    .eq("doctor_id", doctorId)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const mappedReferrals = data.map((referral) => {
    const specialist = Array.isArray(referral.specialist)
      ? referral.specialist[0]
      : referral.specialist;

    return {
      ...referral,
      specialist: specialist
        ? {
            ...specialist,
            specialty: extractLookupName(specialist.specialties) ?? "",
            hospital: extractLookupName(specialist.hospitals) ?? "",
          }
        : specialist,
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: mappedReferrals,
    page,
    pageSize,
    total,
    totalPages,
  };
}

export async function getReferralById(referralId: string, doctorId: string) {
  const { data, error } = await supabase
    .from("referrals")
    .select(
      `
      *,
      patients (*),
      specialist:doctors!referrals_specialist_id_fkey (
        *,
        specialties(name),
        hospitals(name)
      ),
      referral_status_history (status, changed_at)
    `,
    )
    .eq("id", referralId)
    .eq("doctor_id", doctorId)
    .single();

  if (error) throw new Error(error.message);
  const specialist = Array.isArray(data.specialist)
    ? data.specialist[0]
    : data.specialist;

  return {
    ...data,
    specialist: specialist
      ? {
          ...specialist,
          specialty: extractLookupName(specialist.specialties) ?? "",
          hospital: extractLookupName(specialist.hospitals) ?? "",
        }
      : specialist,
  };
}

export async function updateReferralStatus(
  referralId: string,
  doctorId: string,
  status: "pending" | "sent" | "accepted" | "completed",
) {
  const { data, error } = await supabase
    .from("referrals")
    .update({ status })
    .eq("id", referralId)
    .eq("doctor_id", doctorId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (status === 'sent') {
    const { data: referral } = await supabase
      .from('referrals')
      .select('patients (full_name, email)')
      .eq('id', referralId)
      .single();

    const patientsRaw = referral?.patients as unknown as { full_name: string; email?: string } | { full_name: string; email?: string }[] | null;
    const patient = Array.isArray(patientsRaw) ? patientsRaw[0] : patientsRaw;

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabase.from('patient_tokens').insert({
      token,
      referral_id: referralId,
      expires_at: expiresAt.toISOString(),
    });

    if (patient?.email) {
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      await sendPatientPortalEmail(patient.email, patient.full_name, `${frontendUrl}/p/${token}`);
    }

    return { ...data, patient_token: token };
  }

  return data;
}
