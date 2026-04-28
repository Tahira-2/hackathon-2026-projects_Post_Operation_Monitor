import { supabase } from "../lib/supabase";
import { extractLookupName } from "./lookup-service";

interface SpecialistsQueryOptions {
  specialty?: string;
  page: number;
  pageSize: number;
}

export async function getAvailableSpecialists({
  specialty,
  page,
  pageSize,
}: SpecialistsQueryOptions) {
  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, avatar_url, contact_number, specialties(name), hospitals(name, location)")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  const normalizedSpecialty = specialty?.trim().toLowerCase();
  const allItems = (data ?? [])
    .map((doctor) => {
      const specialtyName = extractLookupName(doctor.specialties) ?? "";
      const hospitalsRelation = doctor.hospitals as
        | { name: string; location?: string | null }
        | Array<{ name: string; location?: string | null }>
        | null;
      const hospitalName = extractLookupName(hospitalsRelation) ?? "";
      const hospitalLocation = Array.isArray(hospitalsRelation)
        ? (hospitalsRelation[0]?.location ?? "")
        : (hospitalsRelation?.location ?? "");

      return {
        id: doctor.id,
        full_name: doctor.full_name,
        avatar_url: doctor.avatar_url ?? null,
        specialty: specialtyName,
        hospital: hospitalName,
        location: hospitalLocation,
        phone: doctor.contact_number ?? "",
        available: true,
        clinician_type: "doctor" as const,
      };
    })
    .filter((doctor) => {
      if (!normalizedSpecialty) return true;
      return doctor.specialty.toLowerCase() === normalizedSpecialty;
    });

  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;

  return {
    items: allItems.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}
