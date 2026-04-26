import { supabase } from "../lib/supabase";
import { extractLookupName } from "./lookup-service";

export async function getAvailableSpecialists(specialty?: string) {
  let query = supabase
    .from("specialists")
    .select(
      "id, full_name, phone, available, specialties(name), hospitals(name)",
    )
    .eq("available", true)
    .order("full_name");

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data
    .map((specialist) => ({
      id: specialist.id,
      full_name: specialist.full_name,
      specialty: extractLookupName(specialist.specialties) ?? "",
      hospital: extractLookupName(specialist.hospitals) ?? "",
      phone: specialist.phone,
      available: specialist.available,
    }))
    .filter((specialist) => {
      if (!specialty) return true;
      return specialist.specialty
        .toLowerCase()
        .includes(specialty.toLowerCase());
    });
}
