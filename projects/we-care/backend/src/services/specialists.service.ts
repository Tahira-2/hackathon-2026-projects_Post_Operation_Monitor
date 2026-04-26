import { supabase } from "../lib/supabase";

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
  let query = supabase
    .from("specialties")
    .select("id, name")
    .order("name");

  if (specialty) {
    query = query.ilike("name", `%${specialty}%`) as typeof query;
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const allItems = (data ?? []).map((s) => ({
    id: s.id,
    full_name: s.name,
    specialty: s.name,
    hospital: "",
    phone: "",
    available: true,
  }));

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
