import { supabase } from "../lib/supabase";
import { randomUUID } from 'crypto';
import { sendPatientPortalEmail } from './email.service';
import { extractLookupName } from "./lookup-service";
import type { ReferralViewType } from "./referral-view";

interface ReferralsQueryOptions {
  page: number;
  pageSize: number;
  type: ReferralViewType;
}

interface DoctorDirectoryRow {
  id: string;
  full_name: string;
  contact_number: string | null;
  specialties: { name: string } | Array<{ name: string }> | null;
  hospitals: { name: string } | Array<{ name: string }> | null;
}

async function getDoctorsByIds(doctorIds: string[]) {
  if (!doctorIds.length) return new Map<string, {
    id: string;
    full_name: string;
    contact_number: string | null;
    specialty: string;
    hospital: string;
  }>();

  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, contact_number, specialties(name), hospitals(name)")
    .in("id", doctorIds);

  if (error) throw new Error(error.message);

  return new Map(
    ((data ?? []) as DoctorDirectoryRow[]).map((doctor) => [
      doctor.id,
      {
        id: doctor.id,
        full_name: doctor.full_name,
        contact_number: doctor.contact_number,
        specialty: extractLookupName(doctor.specialties) ?? "",
        hospital: extractLookupName(doctor.hospitals) ?? "",
      },
    ]),
  );
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
    doctor_id: string;
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
    .insert({
      doctor_id: referralData.doctor_id,
      referred_by: doctorId,
      patient_id: patient.id,
      clinical_notes: referralData.clinical_notes,
      extracted_data: referralData.extracted_data,
      diagnosis: referralData.diagnosis,
      required_specialty: referralData.required_specialty,
      urgency: referralData.urgency,
    })
    .select()
    .single();

  if (referralError) throw new Error(referralError.message);

  return { patient, referral };
}

export async function getReferralsByDoctor(
  doctorId: string,
  { page, pageSize, type }: ReferralsQueryOptions,
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("referrals")
    .select(
      `
      id, clinical_notes, diagnosis, required_specialty, urgency, status, created_at, doctor_id, referred_by,
      patients (id, full_name)
    `,
      { count: "exact" },
    )
    .range(from, to)
    .order("created_at", { ascending: false });

  if (type === "outbound") {
    query = query.eq("referred_by", doctorId);
  } else {
    query = query.eq("doctor_id", doctorId);

    if (type === "pending") {
      query = query.eq("status", "pending");
    }
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);
  const doctorMap = await getDoctorsByIds(
    [
      ...new Set(
        (data ?? [])
          .flatMap((referral) => [referral.doctor_id, referral.referred_by])
          .filter(Boolean),
      ),
    ] as string[],
  );
  const mappedReferrals = data.map((referral) => {
    const relatedDoctorId = type === "outbound" ? referral.doctor_id : referral.referred_by;
    const targetDoctor = doctorMap.get(relatedDoctorId);

    return {
      ...referral,
      targetDoctor,
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
      referral_status_history (status, changed_at)
    `,
    )
    .eq("id", referralId)
    .eq("doctor_id", doctorId)
    .single();

  if (error) throw new Error(error.message);
  const doctorMap = await getDoctorsByIds([data.doctor_id]);
  const targetDoctor = doctorMap.get(data.doctor_id) ?? null;

  return {
    ...data,
    targetDoctor,
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
